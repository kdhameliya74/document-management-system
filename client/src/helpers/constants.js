export const FOLDER_MAX_NAME_LENGTH = 20;
export const FILE_MAX_NAME_LENGTH = 20;

export const DOCUMENT_MODES = Object.freeze({
  EDIT: "edit",
  CREATE: "create",
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
});

export const ERROR_MESSAGES = Object.freeze({
  FOLDER_NAME_REQUIRED: "Folder name is required.",
  FOLDER_NAME_DUPLICATE: "A folder with this name already exists.",
});

export const TRASH_MESSAGES = Object.freeze({
  RESTORE_SUCCESS: "Folder restored to its original location.",
  RESTORE_LOADING: "Restoring folder. This may take a moment…",
  RESTORE_ERROR: "Failed to restore document!",
});

export const FILE_UPLOAD_MESSAGES = Object.freeze({
  UPLOAD_SUCCESS: "File uploaded successfully.",
  UPLOAD_LOADING: "Uploading file. This may take a moment…",
  UPLOAD_FAILED: "Failed to save file details",
});