import mongoose from "mongoose";
import s3Client from "../config/s3.js";
import Document from "../models/Document.model.js";
import User from "../models/User.model.js";
import { DOC_TYPES, PERMISSION_LEVELS } from "../constants/Shared.js";
import { FILE_UPLOAD_STATUS } from "../constants/File.js";
import {
  shortId,
  environment,
  buildCapabilities,
  getEffectivePermission,
  comparePermissions,
  getHighestPermissionLevel,
} from "../utils/helper.util.js";
import { PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { asyncHandler } from "../middlewares/error.middleware.js";

//Helpers
const splitByType = (docs, userId, parentPermission) => {
  const folders = [];
  const files = [];

  for (const doc of docs) {
    const transformed = { ...doc, id: doc._id.toString() };
    if (userId) {
      const ownPermission = getEffectivePermission(doc, userId);
      const effectivePermission = comparePermissions(ownPermission, parentPermission);
      transformed.permission = effectivePermission;
      transformed.permissions = buildCapabilities(effectivePermission);
    }
    if (doc.docType === DOC_TYPES.FOLDER) {
      folders.push(transformed);
    } else {
      files.push(transformed);
    }
  }

  return { folders, files };
};
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
      parentId: ancestor.parentId || "root", // TODO:
    });
    tempParentId = ancestor.parentId;
  }
  return breadcrumbs;
}

async function moveTreeList(req, res, baseFilter) {
  const userId = req.user.id;
  const documents = await Document.find({ ...baseFilter, docType: DOC_TYPES.FOLDER })
    .sort({ name: 1 })
    .select("_id name parentId color")
    .lean();

  const folderIds = documents.map((f) => f._id);

  const childFolders = await Document.find({
    parentId: { $in: folderIds },
    owner: userId,
    docType: DOC_TYPES.FOLDER,
    isTrashed: false,
  })
    .select("parentId")
    .lean();
  const parentsWithChildren = new Set(childFolders.map((c) => c.parentId.toString()));

  const folders = documents.map((folder) => {
    const { _id, ...rest } = folder;
    return {
      ...rest,
      id: _id.toString(),
      hasChildren: parentsWithChildren.has(_id.toString()),
    };
  });
  res.status(200).json({ success: true, folders });
}

async function listSharedDocuments(req, res, baseFilter) {
  const userId = req.user.id;
  const { parentId } = req.query;

  if (parentId) {
    const [sharedItems, currentFolder] = await Promise.all([
      Document.find({
        parentId: baseFilter.parentId,
        isTrashed: baseFilter.isTrashed,
      }).lean(),
      parentId
        ? Document.findOne({ _id: baseFilter.parentId, isTrashed: baseFilter.isTrashed })
        : Promise.resolve(null),
    ]);

    const breadcrumbs = currentFolder ? await buildBreadcrumbs(currentFolder.parentId, userId) : [];
    if (currentFolder) {
      breadcrumbs.push({
        id: currentFolder._id.toString(),
        name: currentFolder.name,
        parentId: currentFolder.parentId || "shared",
      });
    }

    let parentPermission = null;
    if (currentFolder) {
      const parts = currentFolder.path.split("/").filter(Boolean);
      const ancestorPaths = [];
      let tempPath = "";
      for (const part of parts) {
        tempPath += `/${part}`;
        ancestorPaths.push(tempPath);
      }
      const hierarchy = await Document.find({
        path: { $in: ancestorPaths },
        owner: currentFolder.owner,
        isTrashed: false,
      }).select("sharedWith isPublic owner");
      parentPermission = getHighestPermissionLevel(hierarchy, userId);
    }

    const { folders, files } = splitByType(sharedItems, userId, parentPermission);
    return res.status(200).json({
      success: true,
      currentFolder,
      breadcrumbs,
      folders,
      files,
    });
  }

  const documents = await Document.find({
    isTrashed: baseFilter.isTrashed,
    "sharedWith.user": userId,
  }).lean();

  const sharedIds = new Set(documents.map((d) => d._id.toString()));

  const rootShared = documents.filter((d) => !d.parentId || !sharedIds.has(d.parentId.toString()));

  const { folders, files } = splitByType(rootShared, userId, null);
  return res.status(200).json({
    success: true,
    breadcrumbs: [],
    currentFolder: null,
    folders,
    files,
  });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

// @desc    List documents inside a folder (folders + files)
// @route   GET /api/documents?parentId=<id>
export const listDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { parentId = null, mode = null } = req.query;

  const baseFilter = {
    owner: userId,
    parentId: parentId || null,
    isTrashed: false,
  };

  if (["move", "shared"].includes(mode)) {
    const modeActions = {
      move: moveTreeList,
      shared: listSharedDocuments,
    };
    return modeActions[mode](req, res, baseFilter);
  }

  const [items, currentFolder] = await Promise.all([
    Document.find(baseFilter).sort({ docType: -1, name: 1 }).lean(), // folders first
    parentId
      ? Document.findOne({ _id: parentId, owner: userId, isTrashed: false })
      : Promise.resolve(null),
  ]);

  const breadcrumbs = currentFolder ? await buildBreadcrumbs(currentFolder.parentId, userId) : [];

  // Add current folder itself at the end of breadcrumbs if we're inside one
  if (currentFolder) {
    breadcrumbs.push({
      id: currentFolder._id.toString(),
      name: currentFolder.name,
      parentId: currentFolder.parentId || "root",
    });
  }

  const { folders, files } = splitByType(items, userId, PERMISSION_LEVELS.ADMIN);

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
  return res.status(200).json({ success: true, document: req.document });
});

// @route   PATCH /api/documents/:id
export const updateDocument = asyncHandler(async (req, res) => {
  const doc = req.document;

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
  const doc = req.document;

  const trashedAt = new Date();
  const pathRegex = new RegExp(`^${doc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/|$)`);

  // Soft-delete doc itself + all descendants (not already trashed)
  await Document.updateMany(
    { path: { $regex: pathRegex }, isTrashed: false },
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
      }).lean(),

      Document.findOne({
        _id: parentId,
        owner: ownerId,
        isTrashed: true,
      }),
    ]);

    const { folders, files } = splitByType(trashedItems, req.user.id, PERMISSION_LEVELS.ADMIN);
    return res.status(200).json({
      success: true,
      currentFolder,
      folders,
      files,
    });
  }

  // Root trash
  const trashedItems = await Document.find({
    owner: ownerId,
    isTrashed: true,
  }).lean();

  const trashedIds = new Set(trashedItems.map((d) => d._id.toString()));

  const rootTrash = trashedItems.filter(
    (d) => !d.parentId || !trashedIds.has(d.parentId.toString()),
  );

  const { folders, files } = splitByType(rootTrash, req.user.id, PERMISSION_LEVELS.ADMIN);
  return res.status(200).json({
    success: true,
    folders,
    files,
  });
});

// @route   PATCH /api/documents/:id/restore
export const restoreDocument = asyncHandler(async (req, res) => {
  const doc = req.document;

  const pathRegex = new RegExp(`^${doc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(/|$)`);

  await Document.updateMany(
    { path: { $regex: pathRegex }, isTrashed: true },
    { $set: { isTrashed: false, trashedAt: null } },
  );

  return res.status(200).json({ success: true, message: "Document restored successfully" });
});

// @route   DELETE /api/documents/:id
export const permanentDelete = asyncHandler(async (req, res) => {
  const targetDoc = req.document;

  const isFolder = targetDoc.docType === DOC_TYPES.FOLDER;
  let docsToDelete = [targetDoc];

  if (isFolder) {
    const escapedPath = targetDoc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pathRegex = new RegExp(`^${escapedPath}/`);
    const descendants = await Document.find({
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
    message: "Deleted",
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

// @route   PATCH /api/documents/:id/move
export const moveDocument = asyncHandler(async (req, res) => {
  const { parentId } = req.body;
  const document = req.document;
  const currentParent = document.parentId?.toString() || null;
  const targetParent = parentId || null;

  if (currentParent === targetParent) {
    return res.status(200).json({ success: true, message: "Document already in target folder" });
  }

  if (targetParent) {
    const targetFolder = await Document.findOne({
      _id: targetParent,
      owner: req.user.id,
      docType: DOC_TYPES.FOLDER,
      isTrashed: false,
    });

    if (!targetFolder) {
      return res.status(400).json({
        success: false,
        message: "Target folder not found or is not a valid folder",
      });
    }
  }
  document.parentId = targetParent;
  await document.save();

  return res.status(200).json({ success: true, message: "Document moved successfully" });
});

// @route   POST /api/documents/:id/share
export const shareDocument = asyncHandler(async (req, res) => {
  const { collaborators } = req.body;

  if (!req.document) {
    return res.status(404).json({
      success: false,
      message: "Document not found",
    });
  }

  const emails = collaborators.map((c) => c.email.toLowerCase());

  const users = await User.find({
    email: { $in: emails },
  })
    .select("_id email")
    .lean();

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No valid users found",
    });
  }

  // Prevent owner sharing to himself
  if (users.some((u) => u._id.toString() === req.user.id.toString())) {
    return res.status(400).json({
      success: false,
      message: "You cannot share a document with yourself",
    });
  }

  const userMap = new Map(users.map((u) => [u.email, u._id]));

  const sharedAt = new Date();

  const newCollaborators = collaborators
    .filter((c) => userMap.has(c.email.toLowerCase()))
    .map((c) => ({
      user: userMap.get(c.email.toLowerCase()),
      email: c.email.toLowerCase(),
      permission: c.permission,
      sharedAt,
    }));

  if (newCollaborators.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid collaborators to add",
    });
  }

  await Document.updateOne(
    { _id: req.document._id },
    {
      $addToSet: {
        sharedWith: {
          $each: newCollaborators,
        },
      },
    },
  );

  return res.status(200).json({
    success: true,
    message: "Document shared successfully",
  });
});
