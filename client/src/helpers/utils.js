import { FOLDER_MAX_NAME_LENGTH, FILE_MAX_NAME_LENGTH, DOCUMENT_MODES } from "@/helpers/constants.js";

export const logError = (err) => {
  if (import.meta.env.MODE !== "production") {
    console.error(err);
  }
};

export const truncateFileName = (name) => {
  const maxLength = FILE_MAX_NAME_LENGTH;
  if (name.length <= maxLength) return name;

  const lastDotIndex = name.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return name.substring(0, maxLength) + "...";
  }

  const extension = name.substring(lastDotIndex);
  const nameWithoutExt = name.substring(0, lastDotIndex);
  const availableLength = maxLength - extension.length - 3; // 3 for '...'

  if (availableLength <= 0) {
    return name.substring(0, maxLength) + "...";
  }

  return nameWithoutExt.substring(0, availableLength) + "..." + extension;
};

export const truncateFolderName = (name) => {
  const maxLength = FOLDER_MAX_NAME_LENGTH;
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + "...";
};

export const uuidToBase64 = (uuid) => {
  const hex = uuid.replace(/-/g, "");
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((h) => parseInt(h, 16)));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .slice(0, 12);
};

export const getBaseName = (fileName) => {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
};

export const getFileExtension = (fileName) => {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.substring(lastDot + 1) : null;
};

export const getDocumentFlags = (mode, docType) => ({
  isCreate: mode === DOCUMENT_MODES.CREATE,
  isUpdate: mode === DOCUMENT_MODES.UPDATE,
  isFolder: docType === "folder",
  isFile: docType === "file",
});