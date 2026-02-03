import { asyncHandler } from "../middleware/error.js";
import Folder from "../models/Folder.js";

// @desc   Create folder
// @route  POST /api/folder/create
// @access Private
export const createFolder = asyncHandler(async (req, res, next) => {
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

export const getFolders = asyncHandler(async (req, res, next) => {
  console.log('I am here')
  const userId = req.user?.id;
  const { parent } = req.body;

  const folders = await Folder.find({
    parent: parent || null,
    isTrashed: false,
    owner: userId
  });

  return res.status(201).json({
    success: true,
    folders
  });

});
