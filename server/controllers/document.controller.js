import mongoose from "mongoose";
import s3Client from "../config/s3.js";
import Document from "../models/Document.model.js";
import { DOC_TYPES } from "../constants/Shared.js";
import { FILE_UPLOAD_STATUS } from "../constants/File.js";
import { shortId, environment } from "../utils/helper.util.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asyncHandler } from "../middlewares/error.middleware.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build breadcrumbs for a given document by walking parent chain.
 * @param {string} parentId - The `parent` ObjectId of the current folder
 * @param {string} userId   - Owner filter for safety
 * @returns {Array} breadcrumb array in root→current order
 */
async function buildBreadcrumbs(parentId, userId) {
    const breadcrumbs = [];
    let tempParentId = parentId;

    while (tempParentId) {
        const ancestor = await Document.findOne({
            _id: tempParentId,
            owner: userId,
            isTrashed: false,
        }).select("_id name parent");

        if (!ancestor) break;

        breadcrumbs.unshift({
            id: ancestor._id,
            name: ancestor.name,
            parentId: ancestor.parent || "root",
        });
        tempParentId = ancestor.parent;
    }
    return breadcrumbs;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    List documents inside a folder (folders + files)
// @route   GET /api/documents?parent=<id>
// @access  Private
export const listDocuments = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { parent = null } = req.query;

    const baseFilter = {
        owner: userId,
        parent: parent || null,
        isTrashed: false,
    };

    const [items, currentFolder] = await Promise.all([
        Document.find(baseFilter).sort({ docType: -1, name: 1 }), // folders first
        parent
            ? Document.findOne({ _id: parent, owner: userId, isTrashed: false })
            : Promise.resolve(null),
    ]);

    const breadcrumbs = currentFolder
        ? await buildBreadcrumbs(currentFolder.parent, userId)
        : [];

    // Add current folder itself at the end of breadcrumbs if we're inside one
    if (currentFolder) {
        breadcrumbs.push({
            id: currentFolder._id,
            name: currentFolder.name,
            parentId: currentFolder.parent || "root",
        });
    }

    const folders = items.filter((d) => d.docType === DOC_TYPES.FOLDER);
    const files = items.filter((d) => d.docType === DOC_TYPES.FILE);

    return res.status(200).json({
        success: true,
        items,        // unified list sorted folders-first
        folders,      // convenience split
        files,        // convenience split
        currentFolder,
        breadcrumbs,
    });
});

// @desc    Create a folder document
// @route   POST /api/documents/folders
// @access  Private
export const createFolder = asyncHandler(async (req, res) => {
    const { name, parent, color } = req.body;
    const owner = req.user.id;

    if (!name) {
        return res.status(400).json({ success: false, message: "Please provide a folder name" });
    }

    // Validate parent exists and belongs to owner
    if (parent) {
        const parentFolder = await Document.findOne({
            _id: parent,
            owner,
            docType: DOC_TYPES.FOLDER,
            isTrashed: false,
        });
        if (!parentFolder) {
            return res.status(404).json({
                success: false,
                message: "Parent folder not found or access denied",
            });
        }
    }

    // Prevent duplicate names in same location
    const duplicate = await Document.findOne({
        name,
        parent: parent || null,
        owner,
        docType: DOC_TYPES.FOLDER,
        isTrashed: false,
    });
    if (duplicate) {
        return res.status(400).json({
            success: false,
            message: "A folder with this name already exists in this location",
        });
    }

    const folder = await Document.create({
        docType: DOC_TYPES.FOLDER,
        name,
        parent: parent || null,
        color: color || null,
        owner,
    });

    return res.status(201).json({ success: true, message: "Folder created successfully", folder });
});

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getDocumentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await Document.findOne({ _id: id, owner: userId });
    if (!doc) {
        return res.status(404).json({ success: false, message: "Document not found" });
    }

    return res.status(200).json({ success: true, document: doc });
});

// @desc    Update a document (rename, recolor, star, etc.)
// @route   PATCH /api/documents/:id
// @access  Private
export const updateDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await Document.findOne({ _id: id, owner: userId });
    if (!doc) {
        return res.status(404).json({ success: false, message: "Document not found" });
    }

    // Per-docType allowed field whitelist
    const commonAllowed = ["name", "isStarred", "description", "tags", "isPublic"];
    const folderExtra = ["color"];
    const fileExtra = [];  // extend as needed

    const allowed =
        doc.docType === DOC_TYPES.FOLDER
            ? [...commonAllowed, ...folderExtra]
            : [...commonAllowed, ...fileExtra];

    let changed = false;
    allowed.forEach((field) => {
        if (req.body[field] !== undefined) {
            doc[field] = req.body[field];
            changed = true;
        }
    });

    if (!changed) {
        return res.status(400).json({ success: false, message: "No valid fields provided to update" });
    }

    await doc.save(); // triggers pre('validate') → path recompute if name changed

    return res.status(200).json({
        success: true,
        message: "Document updated successfully",
        document: doc,
    });
});

// @desc    Soft-delete a document (move to trash; cascades into children)
// @route   DELETE /api/documents/:id
// @access  Private
export const trashDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await Document.findOne({ _id: id, owner: userId });
    if (!doc) {
        return res.status(404).json({ success: false, message: "Document not found" });
    }

    const trashedAt = new Date();
    const pathRegex = new RegExp(`^${doc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/|$)`);

    // Soft-delete doc itself + all descendants (same owner, not already trashed)
    await Document.updateMany(
        { owner: userId, path: { $regex: pathRegex }, isTrashed: false },
        { $set: { isTrashed: true, trashedAt } },
    );

    return res.status(200).json({ success: true, message: "Document moved to trash successfully" });
});

// @desc    List top-level trashed documents
// @route   GET /api/documents/trash
// @access  Private
export const listTrash = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const ownerId = new mongoose.Types.ObjectId(userId);

    // Only return "root" trash items — items whose parent is either null
    // or whose parent is NOT also trashed (prevents double-listing nested items)
    const trashedItems = await Document.aggregate([
        { $match: { owner: ownerId, isTrashed: true } },
        {
            $lookup: {
                from: "documents",
                localField: "parent",
                foreignField: "_id",
                as: "parentInfo",
            },
        },
        { $unwind: { path: "$parentInfo", preserveNullAndEmptyArrays: true } },
        {
            $match: {
                $or: [{ parent: null }, { "parentInfo.isTrashed": false }],
            },
        },
        { $addFields: { id: "$_id" } },
        { $project: { parentInfo: 0 } },
    ]);

    const folders = trashedItems.filter((d) => d.docType === DOC_TYPES.FOLDER);
    const files = trashedItems.filter((d) => d.docType === DOC_TYPES.FILE);

    return res.status(200).json({ success: true, items: trashedItems, folders, files });
});

// @desc    Restore a document from trash (cascades into children)
// @route   PATCH /api/documents/:id/restore
// @access  Private
export const restoreDocument = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const doc = await Document.findOne({ _id: id, owner: userId, isTrashed: true });
    if (!doc) {
        return res.status(404).json({ success: false, message: "Document not found in trash" });
    }

    const pathRegex = new RegExp(`^${doc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/|$)`);

    await Document.updateMany(
        { owner: userId, path: { $regex: pathRegex }, isTrashed: true },
        { $set: { isTrashed: false, trashedAt: null } },
    );

    return res.status(200).json({ success: true, message: "Document restored successfully" });
});

// @desc    Get presigned S3 URLs for direct client-side upload
// @route   POST /api/documents/upload-urls
// @access  Private
export const getPresignedUrls = asyncHandler(async (req, res) => {
    const files = req.body;

    if (!files?.length) {
        return res.status(400).json({ success: false, message: "No files provided" });
    }

    const userId = req.user.id;
    const bucket = process.env.AWS_S3_BUCKET;
    const keyPrefix = `${environment}/users/${userId}/`;

    const results = await Promise.allSettled(
        files.map(async (file) => {
            const extension = file.fileName.split(".").pop();
            const storageKey = `${keyPrefix}${shortId(16)}.${extension}`;
            const command = new PutObjectCommand({
                Bucket: bucket,
                Key: storageKey,
                ContentType: file.fileType,
            });
            const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return { bucket, uploadUrl, storageKey, fileName: file.fileName, uid: file.uid };
        }),
    );

    const successfulUploads = [];
    const failedUploads = [];

    results.forEach((result) => {
        if (result.status === "fulfilled") successfulUploads.push(result.value);
        else failedUploads.push({ reason: result.reason?.message });
    });

    return res.status(200).json({ success: true, successfulUploads, failedUploads });
});

// @desc    Confirm S3 upload and create file document record
// @route   POST /api/documents/upload-confirm
// @access  Private
export const confirmUpload = asyncHandler(async (req, res) => {
    const {
        name,
        originalName,
        extension,
        mimeType,
        size,
        storageKey,
        bucket,
        parent,          // folder the file lives in (was `folderId`)
        uploadStatus,
    } = req.body;

    const owner = req.user.id;

    const file = await Document.create({
        docType: DOC_TYPES.FILE,
        name,
        originalName,
        extension,
        mimeType,
        size,
        storageKey,
        bucket,
        storageProvider: "s3",
        parent: parent || null,
        uploadStatus: uploadStatus || FILE_UPLOAD_STATUS.COMPLETED,
        owner,
    });

    return res.status(201).json({ success: true, message: "File record created", file });
});
