export const FOLDER_MAX_NAME_LENGTH = 20;
export const FILE_MAX_NAME_LENGTH = 20;

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
});
