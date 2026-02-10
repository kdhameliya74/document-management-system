import mongoose from "mongoose";
import { asyncHandler } from "../middleware/error.js";
import Folder from "../models/Folder.js";

export const getTrashedDocs = asyncHandler(async (req, res) => {
  const { parent } = req.query;
  const userId = req.user.id;
  const ownerId = new mongoose.Types.ObjectId(userId);

  if (parent) {
    const folders = await Folder.find({
      parent: parent || null,
      owner: userId,
      isTrashed: true,
    });

    let currentFolder = null;

    if (parent) {
      currentFolder = await Folder.findOne({
        _id: parent,
        owner: userId,
        isTrashed: true,
      });
    }
    return res.status(200).json({
      success: true,
      folders,
      currentFolder,
    });
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
  res.status(404).json({
    success: true,
    message: "Document restored successfully",
  });
});
