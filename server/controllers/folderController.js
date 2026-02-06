import { asyncHandler } from "../middleware/error.js";
import Folder from "../models/Folder.js";

// @desc   Create folder
// @route  POST /api/folder/create
// @access Private
export const createFolder = asyncHandler(async (req, res, _next) => {
  const { name, parent, color } = req.body;
  const owner = req.user?.id || req.body.owner;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Please provide a folder name",
    });
  }

  if (parent) {
    const parentFolder = await Folder.findOne({
      _id: parent,
      owner,
      isTrashed: false,
    });
    if (!parentFolder) {
      return res.status(404).json({
        success: false,
        message: "Parent folder not found or access denied",
      });
    }
  }

  const existingFolder = await Folder.findOne({
    name,
    parent: parent || null,
    owner,
    isTrashed: false,
  });

  if (existingFolder) {
    return res.status(400).json({
      success: false,
      message: "A folder with this name already exists in this location",
    });
  }

  const folder = await Folder.create({
    name,
    parent: parent || null,
    color,
    owner,
  });

  // 201 code means resource created successfully
  return res.status(201).json({
    success: true,
    message: "Folder created successfully",
    folder,
  });
});

// @desc   Get all folders
// @route  GET /api/folder/all
// @access Private
export const getFolders = asyncHandler(async (req, res, _next) => {
  const userId = req.user?.id;
  const { parent } = req.body;

  const folders = await Folder.find({
    parent: parent || null,
    isTrashed: false,
    owner: userId,
  });

  let currentFolder = null;
  let breadcrumbs = [];

  if (parent) {
    currentFolder = await Folder.findOne({
      _id: parent,
      owner: userId,
      isTrashed: false,
    });

    if (currentFolder) {
      let tempParentId = currentFolder.parent;
      while (tempParentId) {
        const ancestor = await Folder.findOne({
          _id: tempParentId,
          owner: userId,
          isTrashed: false,
        }).select("_id name parent");

        if (ancestor) {
          breadcrumbs.unshift({
            id: ancestor._id,
            name: ancestor.name,
            parentId: ancestor.parent || "root",
          });
          tempParentId = ancestor.parent;
        } else {
          tempParentId = null;
        }
      }
    }
  }

  return res.status(200).json({
    success: true,
    folders,
    currentFolder,
    breadcrumbs,
  });
});

export const updateDocument = asyncHandler(async (req, res, _) => {
  const { docId } = req.params;
  const document = await Folder.findById(docId);
  if (!document) {
    return res.status(404).json({
      success: false,
      message: "Document not found!",
    });
  }
  const allTopLevelFields = Object.keys(Folder.schema.obj);
  const forbiddenFields = ["owner", "parent", "path", "publicLink", "trashedAt", "sharedWith"];
  const updates = {};
  const allowedFields = allTopLevelFields.filter((field) => !forbiddenFields.includes(field));

  allowedFields.forEach((field) => {
    if (req?.body?.[field]) updates[field] = req.body[field];
  });

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: "No valid fields provided to update" });
  }
  await Folder.updateOne({ _id: docId }, { $set: updates });
  res.status(200).json({
    success: true,
    message: "Document updated successfully!",
  });
});

export const deleteDocument = asyncHandler(async (req, res, _) => {
  const { docId } = req.params;
  const doc = await Folder.findById(docId);
  if (!doc) {
    return res.status(404).json({
      success: false,
      message: "Document not found!",
    });
  }

  // TODO: check special characters
  // const escapedPath = doc.path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const pathRegex = new RegExp(`^${doc.path}`);
  const trashedAt = new Date();
  await Folder.updateMany(
    {
      path: { $regex: pathRegex },
      isTrashed: false, // only update which not trashed already
      // owner: TODO: Only owner and authorized user can delete
    },
    {
      $set: {
        isTrashed: true,
        trashedAt: trashedAt,
      },
    },
  );

  res.status(200).json({ message: "Document moved to trash successfully", success: true });
});
