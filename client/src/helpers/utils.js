import {
  FOLDER_MAX_NAME_LENGTH,
  FILE_MAX_NAME_LENGTH,
  DOCUMENT_MODES,
} from "@/helpers/constants.js";

export const logError = (err) => {
  if (import.meta.env.MODE !== "production") {
    console.error(err);
  }
};

export const truncateName = (item, maxLength) => {
  if (item.docType === "folder") {
    return truncateFolderName(item.name, maxLength);
  }
  return truncateFileName(item.name, maxLength);
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

export const getDocumentFlags = (mode, docType) => {
  const isCreate = mode === DOCUMENT_MODES.CREATE;
  const isUpdate = mode === DOCUMENT_MODES.UPDATE;

  return {
    isCreate,
    isUpdate,
    isFolder: isUpdate && docType === "folder",
    isFile: isUpdate && docType === "file",
  };
};

export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;

  const trimmedEmail = email.trim().toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  return emailRegex.test(trimmedEmail);
};

export const getViewerType = (mimeType) => {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType === "application/pdf") return "pdf";
  return null;
};

export const isViewableFile = (mimeType) => {
  if (!mimeType) return false;
  return !!getViewerType(mimeType);
};

export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const formatFileSize = (size, unit = "auto", precision = 2) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (size === 0) return "0 B";

  if (unit !== "auto") {
    const index = units.indexOf(unit.toUpperCase());
    if (index === -1) return "Invalid unit";
    const value = size / Math.pow(1024, index);
    return `${value.toFixed(precision)} ${units[index]}`;
  }
  const i = Math.floor(Math.log(size) / Math.log(1024));
  const value = size / Math.pow(1024, i);

  return `${value.toFixed(precision)} ${units[i]}`;
};