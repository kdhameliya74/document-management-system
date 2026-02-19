import React from "react";
import FileIcon from "@/components/common/FileIcon";
import { truncateFileName } from "@/helpers/utils.js";

const FileItem = ({ file, isSelected, onSelect, onContextMenu }) => {
  const displayName = truncateFileName(file.name);

  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all group border-2 ${
        isSelected
          ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/10"
          : "border-transparent hover:bg-bg-hover hover:border-border-muted"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(file.id);
      }}
      onContextMenu={(e) => onContextMenu(e, file, "file")}
      title={file.name}
    >
      <div className="relative p-2 rounded-xl bg-bg-panel border border-border-muted group-hover:border-primary/30 transition-colors">
        <FileIcon mimeType={file.mimeType} size={48} strokeWidth={1} />
      </div>
      <span
        className={`text-sm text-center break-all line-clamp-2 px-1 truncate ${
          isSelected ? "text-primary" : "text-text-main"
        }`}
      >
        {displayName}
      </span>
    </div>
  );
};

export default FileItem;
