import { getFileIcon } from "@/shared/utils/fileIcons.js";
const FileIcon = ({ mimeType = "", size = 35, strokeWidth = 2 }) => {
  // Find matching file type
  const match = getFileIcon(mimeType);
  const IconComponent = match.Icon;
  const className = match.className;

  return <IconComponent size={size} strokeWidth={strokeWidth} className={className} />;
};

export default FileIcon;
