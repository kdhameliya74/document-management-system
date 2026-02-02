import {
  FOLDER_MAX_NAME_LENGTH,
  FILE_MAX_NAME_LENGTH,
} from "@/helpers/constants.js";

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
