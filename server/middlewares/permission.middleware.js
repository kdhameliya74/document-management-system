import Document from "../models/Document.model.js";
import { PERMISSION_CAPABILITIES } from "../constants/Shared.js";
import { asyncHandler } from "./error.middleware.js";

export const checkPermission = (capability, idSource = "params", idKey = "id") => {
  return asyncHandler(async (req, res, next) => {
    const documentId = req[idSource][idKey];
    const userId = req.user.id;

    if (!documentId) {
      return res.status(400).json({
        success: false,
        message: "Document ID is required",
      });
    }

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // 1. Check if user is the owner
    if (document.owner.toString() === userId) {
      req.document = document;
      return next();
    }

    // 2. Ancestor / Inheritance Logic
    const parts = document.path.split("/").filter(Boolean);
    const ancestorPaths = [];
    let currentPath = "";
    for (const part of parts) {
      currentPath += `/${part}`;
      ancestorPaths.push(currentPath);
    }

    // Fetch all documents in the hierarchy (target + all parents)
    const hierarchy = await Document.find({
      path: { $in: ancestorPaths },
      owner: document.owner,
      isTrashed: false,
    }).select("sharedWith isPublic owner");

    const { getHighestPermissionLevel } = await import("../utils/helper.util.js");
    const effectivePermission = getHighestPermissionLevel(hierarchy, userId);

    if (effectivePermission) {
      const userCapabilities = PERMISSION_CAPABILITIES[effectivePermission] || [];
      if (userCapabilities.includes(capability)) {
        req.document = document;
        req.effectivePermission = effectivePermission;
        return next();
      }
    }

    // 4. No permission
    return res.status(403).json({
      success: false,
      code: "PERMISSION_DENIED",
      message: `You do not have permission to ${capability} this document`,
    });
  });
};
