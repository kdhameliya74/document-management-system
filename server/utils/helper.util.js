import crypto from "crypto";
import mongoose from "mongoose";
import { PERMISSION_RANK, PERMISSION_LEVELS } from "../constants/Shared.js";

export const isProduction = process.env.NODE_ENV === "production";

export const environment = isProduction ? "prod" : "dev";

export const isValidObjectId = (id) => {
  return id === null ? true : mongoose.Types.ObjectId.isValid(id);
};

export const shortId = (length = 16) => {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
};

export const getEffectivePermission = (doc, userId) => {
  if (doc.owner.toString() === userId.toString()) {
    return PERMISSION_LEVELS.ADMIN;
  }
  if (doc.isPublic) {
    return PERMISSION_LEVELS.VIEW;
  }
  const shared = doc.sharedWith.find(
    (s) => s.user?.toString() === userId.toString()
  );

  if (!shared) return null;

  return shared.permission;
}

export const buildCapabilities = (permission) => {
  if (!permission) return null;

  const rank = PERMISSION_RANK[permission.toUpperCase()];

  return {
    role: permission,
    canView: rank >= PERMISSION_RANK.VIEW,
    canEdit: rank >= PERMISSION_RANK.EDIT,
    canDelete: rank >= PERMISSION_RANK.ADMIN,
    canShare: rank >= PERMISSION_RANK.ADMIN,
    canMove: rank >= PERMISSION_RANK.EDIT,
    canDownload: rank >= PERMISSION_RANK.VIEW,
  };
}