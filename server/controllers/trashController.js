import { asyncHandler } from "../middleware/error.js";
// import Folder from "../models/Folder.js";

export const getTrashedDocs = asyncHandler(async (req, res) => {

  // TODO:
  // 1. fetch user's docs only
  // 2. make breadcrumbs
  // 3. send docs as root whose parent is not trashed

  res.status(200).json({
    success: true,
    documents: [
      {
        _id: "69846c175246e6abf7e0e588",
        name: "old",
        owner: "693936c0923b61e6df102dd9",
        parent: null,
        color: "#f59e0b",
        isStarred: false,
        isTrashed: false,
        trashedAt: null,
        isPublic: false,
        sharedWith: [],
        path: "/images",
        createdAt: "2026-02-05T10:08:23.864Z",
        updatedAt: "2026-02-06T10:59:13.784Z",
        __v: 0,
        id: "69846c175246e6abf7e0e588",
      },
    ],
  });
});

export const restoreDocument = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Document restored successfully",
  });
});
