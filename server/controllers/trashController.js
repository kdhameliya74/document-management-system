import { asyncHandler } from "../middleware/error.js";
// import Folder from "../models/Folder.js";
import { fetchFolderUtils } from "./folderController.js";

export const getTrashedDocs = asyncHandler(async (req, res) => {
  const folders = await fetchFolderUtils(req, { isTrashed: true }, "trash");
  return res.status(200).json(folders);
});

export const restoreDocument = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Document restored successfully",
  });
});
