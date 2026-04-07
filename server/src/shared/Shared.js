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

export const ACTIVITY_ACTIONS = {
  FILE_UPLOAD: "file_upload",
  FILE_DOWNLOAD: "file_download",
  FILE_UPDATE: "file_update",
  FILE_DELETE: "file_delete",
  FILE_PERMANENT_DELETE: "file_permanent_delete",
  FILE_RESTORE: "file_restore",
  FILE_SHARE: "file_share",
  FILE_UNSHARE: "file_unshare",
  FILE_RENAME: "file_rename",
  FILE_MOVE: "file_move",
  FOLDER_CREATE: "folder_create",
  FOLDER_DELETE: "folder_delete",
  FOLDER_PERMANENT_DELETE: "folder_permanent_delete",
  FOLDER_RESTORE: "folder_restore",
  FOLDER_UPDATE: "folder_update",
  FOLDER_MOVE: "folder_move",
  FOLDER_SHARE: "folder_share",
  FOLDER_UNSHARE: "folder_unshare",
  COMMENT_ADD: "comment_add",
  COMMENT_EDIT: "comment_edit",
  COMMENT_DELETE: "comment_delete",
  VERSION_CREATE: "version_create",
  VERSION_RESTORE: "version_restore",
};
