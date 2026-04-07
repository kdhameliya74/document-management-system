import crypto from "crypto";
import mongoose from "mongoose";
import { PERMISSION_RANK, PERMISSION_LEVELS } from "../shared/Shared.js";

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
  const shared = doc.sharedWith.find((s) => s.user?.toString() === userId.toString());

  if (shared) return shared.permission;
  if (doc.isPublic) return PERMISSION_LEVELS.VIEW;

  return null;
};

export const getHighestPermissionLevel = (hierarchy, userId) => {
  let highestRank = -1;
  let highestLevel = null;

  for (const doc of hierarchy) {
    const level = getEffectivePermission(doc, userId);
    if (level) {
      const rank = PERMISSION_RANK[level.toUpperCase()];
      if (rank > highestRank) {
        highestRank = rank;
        highestLevel = level;
      }
    }
  }

  return highestLevel;
};

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
};
export const comparePermissions = (p1, p2) => {
  if (!p1) return p2;
  if (!p2) return p1;

  const r1 = PERMISSION_RANK[p1.toUpperCase()] || 0;
  const r2 = PERMISSION_RANK[p2.toUpperCase()] || 0;

  return r1 >= r2 ? p1 : p2;
};
