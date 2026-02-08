import { asyncHandler } from "../middleware/error.js";
// import Folder from "../models/Folder.js";

export const getTrashedDocs = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
  });
});

export const restoreDocument = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Document restored successfully",
  });
});
