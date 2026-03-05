export const DOC_TYPES = {
  FILE: "file",
  FOLDER: "folder",
};

export const DOC_TYPES_ARRAY = [DOC_TYPES.FILE, DOC_TYPES.FOLDER];

export const PERMISSION_RANK = {
  VIEW: 1,
  EDIT: 2,
  ADMIN: 3,
};

export const PERMISSION_LEVELS = {
  VIEW: "view",
  COMMENT: "comment",
  EDIT: "edit",
  ADMIN: "admin",
};

export const PERMISSION_ARRAY = Object.values(PERMISSION_LEVELS);

export const PERMISSION_CAPABILITIES = {
  [PERMISSION_LEVELS.VIEW]: ["view", "download"],
  [PERMISSION_LEVELS.COMMENT]: ["view", "download", "comment"],
  [PERMISSION_LEVELS.EDIT]: ["view", "download", "comment", "edit", "rename", "move", "trash"],
  [PERMISSION_LEVELS.ADMIN]: [
    "view",
    "download",
    "comment",
    "edit",
    "rename",
    "move",
    "trash",
    "delete",
    "share",
  ],
};
