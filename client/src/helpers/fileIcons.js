import {
  File,
  FileText,
  FileCode,
  Image,
  Video,
  Music,
  Archive,
  Sheet,
  Presentation,
} from "lucide-react";

/**
 * Map file MIME types to icon components and colors
 */
const FILE_TYPE_MAP = [
  {
    test: (type) => type.startsWith("text/plain"),
    Icon: File,
    className: "text-stone-500",
  },
  // Images text/plain
  {
    test: (type) => type.startsWith("image/"),
    Icon: Image,
    className: "text-violet-500",
  },
  // Videos
  {
    test: (type) => type.startsWith("video/"),
    Icon: Video,
    className: "text-red-500",
  },
  // Audio
  {
    test: (type) => type.startsWith("audio/"),
    Icon: Music,
    className: "text-pink-500",
  },
  // PDF
  {
    test: (type) => type === "application/pdf",
    Icon: FileText,
    className: "text-[#ef4444]", // Red-500
  },
  // Word Documents
  {
    test: (type) =>
      [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(type),
    Icon: FileText,
    className: "text-[#3b82f6]", // Blue-500
  },
  // Excel / CSV
  {
    test: (type) =>
      [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/csv",
      ].includes(type),
    Icon: Sheet,
    className: "text-[#22c55e]", // Green-500
  },
  // PowerPoint
  {
    test: (type) =>
      [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ].includes(type),
    Icon: Presentation,
    className: "text-[#f59e0b]", // Amber-500
  },
  // ZIP / Compressed
  {
    test: (type) =>
      [
        "application/zip",
        "application/x-zip-compressed",
        "application/x-rar-compressed",
        "application/x-7z-compressed",
        "application/gzip",
      ].includes(type) ||
      type.includes("zip") ||
      type.includes("rar") ||
      type.includes("7z"),
    Icon: Archive,
    className: "text-yellow-600",
  },
  // JSON
  {
    test: (type) => type === "application/json",
    Icon: FileCode,
    className: "text-amber-500",
  },
];

export const getFileIcon = (mimeType = "") => {
  const match = FILE_TYPE_MAP.find((item) => item.test(mimeType));
  return match ? match : { Icon: File, className: "text-slate-500" };
};
