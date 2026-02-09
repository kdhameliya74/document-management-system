import mongoose from "mongoose";
import { asyncHandler } from "../middleware/error.js";
import Folder from "../models/Folder.js";
import { fetchFolderUtils } from "./folderController.js";

export const getTrashedDocs = asyncHandler(async (req, res) => {
  const { parent } = req.query;
  const userId = req.user.id;
  const ownerId = new mongoose.Types.ObjectId(userId);

  if (parent) {
    // For nested trashed folders, use fetchFolderUtils with isTrashed: true
    const result = await fetchFolderUtils(req, { isTrashed: true }, "trash");
    return res.status(200).json(result);
  }

  const folders = await Folder.aggregate([
    {
      $match: {
        owner: ownerId,
        isTrashed: true,
      },
    },
    {
      $lookup: {
        from: "folders",
        localField: "parent",
        foreignField: "_id",
        as: "parentInfo",
      },
    },
    {
      $unwind: {
        path: "$parentInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $match: {
        $or: [{ parent: null }, { "parentInfo.isTrashed": false }],
      },
    },
    {
      $addFields: {
        id: "$_id",
      },
    },
    {
      $project: {
        parentInfo: 0,
      },
    },
  ]);

  return res.status(200).json({
    success: true,
    folders,
    currentFolder: null,
  });
});

export const restoreDocument = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Document restored successfully",
  });
});
