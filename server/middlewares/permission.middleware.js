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

        // 2. Check shared permissions
        const sharedUser = document.sharedWith.find(
            (share) => share.user && share.user.toString() === userId,
        );

        if (sharedUser) {
            const userCapabilities = PERMISSION_CAPABILITIES[sharedUser.permission] || [];
            if (userCapabilities.includes(capability)) {
                req.document = document;
                return next();
            }
        }

        // 3. Check public access (only for view/download)
        if (document.isPublic && ["view", "download"].includes(capability)) {
            req.document = document;
            return next();
        }

        // 4. No permission
        return res.status(403).json({
            success: false,
            code: "PERMISSION_DENIED",
            message: `You do not have permission to ${capability} this document`,
        });
    });
};
