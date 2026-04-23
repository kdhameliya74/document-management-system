import React from "react";
import FileIcon from "@/shared/components/common/FileIcon";
import { getBaseName, getFileExtension } from "@/shared/utils/utils.js";
import { getFileIcon } from "@/shared/utils/fileIcons.js";

const FileItem = ({ file, isSelected, onSelect, onContextMenu, onDoubleClick, ...props }) => {
  const displayName = getBaseName(file.name);
  const extension = getFileExtension(file.name);
  const { className: colorClass } = getFileIcon(file.mimeType);

  return (
    <div
      {...props}
      className={`flex flex-col items-center gap-2.5 p-4 rounded-3xl cursor-pointer transition-all duration-300 group border border-transparent relative
        ${
          isSelected
            ? "bg-primary/10 border-primary/30 shadow-2xl shadow-primary/10 -translate-y-1"
            : "hover:bg-bg-panel hover:border-border-main hover:shadow-xl hover:-translate-y-1 glass-card"
        }
      `}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(file.id);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onSelect(file.id); // Ensure it's selected
        onDoubleClick && onDoubleClick(file);
      }}
      onContextMenu={(e) => onContextMenu(e, file, "file")}
      title={file.name}
    >
      <div className="relative p-5 rounded-2xl bg-bg-main/50 border border-border-muted group-hover:border-primary/40 transition-all duration-300 shadow-inner group-hover:scale-105 group-hover:rotate-1">
        <div className="absolute inset-0 bg-primary/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <FileIcon
          mimeType={file.mimeType}
          size={42}
          strokeWidth={1.5}
          className="relative drop-shadow-md"
        />

        {extension && (
          <div
            className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/10 shadow-lg ${colorClass} bg-bg-panel backdrop-blur-md`}
          >
            {extension}
          </div>
        )}

        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-bg-panel shadow-sm z-10" />
        )}
      </div>
      <span
        className={`text-[12px] font-medium text-center truncate w-full px-1 select-none transition-colors duration-200 ${
          isSelected ? "text-primary" : "text-text-main group-hover:text-primary"
        }`}
      >
        {displayName}
      </span>
    </div>
  );
};

export default FileItem;
