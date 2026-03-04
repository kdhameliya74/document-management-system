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
  EDIT: "edit",
  ADMIN: "admin",
};

export const PERMISSION_ARRAY = Object.values(PERMISSION_LEVELS);
