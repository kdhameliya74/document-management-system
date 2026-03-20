export const APP_ROOT_NAME = "My Drive";

export const APP_VIEWS_MAP = Object.freeze({
  FOLDERS: "root",
  TRASH: "trash",
  SHARED: "shared",
});

export const FOLDER_MAX_NAME_LENGTH = 20;
export const FILE_MAX_NAME_LENGTH = 20;

export const PAGE_HEADERS = Object.freeze({
  ROOT: "My Drive",
  TRASH: "Trash",
  SHARED: "Shared",
});

export const DOCUMENT_MODES = Object.freeze({
  UPDATE: "update",
  CREATE: "create",
});

export const TRASH_MENU_ACTIONS = Object.freeze({
  RESTORE: "restore",
  DELETE: "delete",
});

export const FOLDER_COLORS = Object.freeze({
  DEFAULT: "#6366f1",
  RED: "#ef4444",
  AMBER: "#f59e0b",
  EMERALD: "#10b981",
  BLUE: "#3b82f6",
  VIOLET: "#8b5cf6",
  PINK: "#ec4899",
  TEAL: "#14b8a6",
  SLATE: "#64748b",
  ORANGE: "#f97316",
  YELLOW: "#eab308",
});

export const DEFAULT_MESSAGES = Object.freeze({
  FAILED_TO_FETCH_DOCUMENTS: "Failed to fetch documents!",
  NO_FOLDERS_AVAILABLE: "No folders available",
  DOCUMENT_MOVE_FAILED: "Failed to move document!",
  DOCUMENT_MOVE_SUCCESS: "Document moved successfully!",
  INVALID_EMAIL: "Please enter a valid email address.",
});

export const ERROR_CODES_WITH_MESSAGES = Object.freeze({
  PERMISSION_DENIED: "You do not have permission to perform this action.",
});

export const FOLDER_MESSAGES = Object.freeze({
  NAME_REQUIRED: "Folder name is required.",
  NAME_DUPLICATE: "A folder with this name already exists.",
  CREATE_TITLE: "New Document",
  UPDATE_TITLE: "Update Document",
  UPDATE_SUCCESS: "Document updated successfully!",
  CREATE_SUCCESS: "Document created successfully!",
  DOCUMENT_SAVE_FAILED: "Failed to create/update document",
});

export const TRASH_MESSAGES = Object.freeze({
  RESTORE_SUCCESS: "Document restored to its original location.",
  RESTORE_LOADING: "Restoring document. This may take a moment…",
  RESTORE_ERROR: "Failed to restore document!",

  DELETE_LOADING: "Deleting document. This may take a moment…",
  DELETE_SUCCESS: "Document deleted successfully!",
  DELETE_ERROR: "Failed to delete document!",
});

export const FILE_MESSAGES = Object.freeze({
  UPLOAD_SUCCESS: "File uploaded successfully.",
  UPLOAD_LOADING: "Uploading file. This may take a moment…",
  UPLOAD_FAILED: "Failed to save file details",

  DOWNLOAD_FAILED: "Failed to download file",
  DOWNLOAD_SUCCESS: "File downloaded successfully.",
  DOWNLOAD_LOADING: "Downloading file. This may take a moment…",

  DOWNLOAD_ZIP_SUCCESS: "Folder zipped and downloaded.",
  DOWNLOAD_ZIP_LOADING: "Zipping and downloading folder. This may take a moment…",
  DOWNLOAD_ZIP_FAILED: "Failed to zip and download folder",
});

export const PERMISSION_LEVELS = Object.freeze({
  VIEW: "view",
  EDIT: "edit",
  ADMIN: "admin",
});

export const SHARE_MESSAGES = Object.freeze({
  SHARE_SUCCESS: "Document shared successfully!",
  SHARE_FAILED: "Failed to share document!",
});

export const USER_PROFILE_MESSAGES = Object.freeze({
  AVATAR_SIZE_ERROR: "File size should be less than 2MB",
  AVATAR_UPLOAD_ERROR: "Failed to upload avatar",
  AVATAR_UPLOAD_SUCCESS: "Avatar uploaded successfully! Save changes to persist.",
  AVATAR_UPLOAD_LOADING: "Uploading avatar...",
  UPDATE_SUCCESS: "Profile updated successfully",
  UPDATE_FAILED: "Failed to update profile",
  PASSWORD_MISMATCH: "Passwords do not match",
  PASSWORD_LENGTH: "New password must be at least 8 characters",
  PASSWORD_SUCCESS: "Password updated successfully",
  PASSWORD_FAILED: "Failed to update password",
});

export const NOTIFICATION_MESSAGES = Object.freeze({
  MARK_ONE_READ_FAILED: "Failed to mark notification as read",
  MARK_ALL_READ_FAILED: "Failed to mark all notifications as read",
});
