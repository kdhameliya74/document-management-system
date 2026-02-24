import mongoose from "mongoose";
import s3Client from "../config/s3.js";
import Document from "../models/Document.model.js";
import { DOC_TYPES } from "../constants/Shared.js";
import { FILE_UPLOAD_STATUS } from "../constants/File.js";
import { shortId, environment } from "../utils/helper.util.js";
import { PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
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
    }).select("_id name parentId");

    if (!ancestor) break;

    breadcrumbs.unshift({
      id: ancestor._id,
      name: ancestor.name,
      parentId: ancestor.parentId || "root",
    });
    tempParentId = ancestor.parentId;
  }
  return breadcrumbs;
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    List documents inside a folder (folders + files)
// @route   GET /api/documents?parentId=<id>
// @access  Private
export const listDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { parentId = null } = req.query;

  const baseFilter = {
    owner: userId,
    parentId: parentId || null,
    isTrashed: false,
  };

  const [items, currentFolder] = await Promise.all([
    Document.find(baseFilter).sort({ docType: -1, name: 1 }), // folders first
    parentId
      ? Document.findOne({ _id: parentId, owner: userId, isTrashed: false })
      : Promise.resolve(null),
  ]);

  const breadcrumbs = currentFolder ? await buildBreadcrumbs(currentFolder.parentId, userId) : [];

  // Add current folder itself at the end of breadcrumbs if we're inside one
  if (currentFolder) {
    breadcrumbs.push({
      id: currentFolder._id,
      name: currentFolder.name,
      parentId: currentFolder.parentId || "root",
    });
  }

  const folders = items.filter((d) => d.docType === DOC_TYPES.FOLDER);
  const files = items.filter((d) => d.docType === DOC_TYPES.FILE);

  return res.status(200).json({
    success: true,
    folders,
    files,
    currentFolder,
    breadcrumbs,
  });
});

// @desc    Create a folder document
// @route   POST /api/documents/folders
// @access  Private
export const createFolder = asyncHandler(async (req, res) => {
  const { name, parentId, color } = req.body;
  const owner = req.user.id;

  if (!name) {
    return res.status(400).json({ success: false, message: "Please provide a folder name" });
  }

  // Validate parent exists and belongs to owner
  if (parentId) {
    const parentFolder = await Document.findOne({
      _id: parentId,
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
    parentId: parentId || null,
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
    parentId: parentId || null,
    color: color || null,
    owner,
  });
  return res.status(201).json({ success: true, message: "Folder created successfully", folder });
});

// @route   GET /api/documents/:id
export const getDocumentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const doc = await Document.findOne({ _id: id, owner: userId });
  if (!doc) {
    return res.status(404).json({ success: false, message: "Document not found" });
  }

  return res.status(200).json({ success: true, document: doc });
});

// @route   PATCH /api/documents/:id
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
  const fileExtra = []; // extend as needed

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

// @route   DELETE /api/documents/:id
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

// @route   PATCH /api/documents/trash
export const listTrash = asyncHandler(async (req, res) => {
  const ownerId = new mongoose.Types.ObjectId(req.user.id);
  const { parentId } = req.query;

  if (parentId) {
    const [trashedItems, currentFolder] = await Promise.all([
      Document.find({
        parentId,
        owner: ownerId,
        isTrashed: true,
      }),

      Document.findOne({
        _id: parentId,
        owner: ownerId,
        isTrashed: true,
      }),
    ]);

    return res.status(200).json({
      success: true,
      currentFolder,
      folders: trashedItems.filter((d) => d.docType === DOC_TYPES.FOLDER),
      files: trashedItems.filter((d) => d.docType === DOC_TYPES.FILE),
    });
  }

  // Root trash
  const trashedItems = await Document.find({
    owner: ownerId,
    isTrashed: true,
  });

  const trashedIds = new Set(trashedItems.map((d) => d._id.toString()));

  const rootTrash = trashedItems.filter(
    (d) => !d.parentId || !trashedIds.has(d.parentId.toString()),
  );

  return res.status(200).json({
    success: true,
    folders: rootTrash.filter((d) => d.docType === DOC_TYPES.FOLDER),
    files: rootTrash.filter((d) => d.docType === DOC_TYPES.FILE),
  });
});

// @route   PATCH /api/documents/:id/restore
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

// @route   DELETE /api/documents/:id
export const permanentDelete = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const targetDoc = await Document.findOne({ _id: id, owner: userId });
  if (!targetDoc) {
    return res.status(404).json({ success: false, message: "Document not found or access denied" });
  }

  const isFolder = targetDoc.docType === DOC_TYPES.FOLDER;
  let docsToDelete = [targetDoc];

  if (isFolder) {
    const escapedPath = targetDoc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathRegex = new RegExp(`^${escapedPath}/`);
    const descendants = await Document.find({
      owner: userId,
      path: { $regex: pathRegex },
    }).select("_id storageKey docType");
    docsToDelete = [...docsToDelete, ...descendants];
  }

  const storageKeys = docsToDelete
    .filter((doc) => doc.docType === DOC_TYPES.FILE && doc.storageKey)
    .map((doc) => doc.storageKey);
  if (storageKeys.length > 0) {
    const bucket = process.env.AWS_S3_BUCKET;

    const CHUNK_SIZE = 1000;
    for (let i = 0; i < storageKeys.length; i += CHUNK_SIZE) {
      const chunk = storageKeys.slice(i, i + CHUNK_SIZE);
      const deleteParams = {
        Bucket: bucket,
        Delete: {
          Objects: chunk.map((key) => ({ Key: key })),
        },
      };

      try {
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
      } catch (error) {
        // TODO: implement bullMQ
        console.error("S3 Batch Deletion Error:", error);
      }
    }
  }

  const docIds = docsToDelete.map((doc) => doc._id);
  await Document.deleteMany({ _id: { $in: docIds } });

  return res.status(200).json({
    success: true,
    message: "Deleted"
  });
});

// @route   POST /api/documents/upload-urls
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

// @route   POST /api/documents/upload-confirm
export const confirmUpload = asyncHandler(async (req, res) => {
  const {
    name,
    originalName,
    extension,
    mimeType,
    size,
    storageKey,
    bucket,
    parentId, // folder the file lives in
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
    parentId: parentId || null,
    uploadStatus: uploadStatus || FILE_UPLOAD_STATUS.COMPLETED,
    owner,
  });

  return res.status(201).json({ success: true, message: "File record created", file });
});
