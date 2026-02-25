import React from "react";
import { Folder } from "lucide-react";
import { FOLDER_COLORS } from "@/helpers/constants.js";
import { truncateFolderName } from "@/helpers/utils.js";

const FolderItem = ({ folder, isSelected, onNavigate, onContextMenu }) => {
  const displayName = truncateFolderName(folder.name);

  return (
    <div
      className={`flex flex-col items-center gap-2.5 p-4 rounded-3xl cursor-pointer transition-all duration-300 group border border-transparent relative
        ${
          isSelected
            ? "bg-primary/10 border-primary/30 shadow-2xl shadow-primary/10 -translate-y-1"
            : "hover:bg-bg-panel hover:border-border-main hover:shadow-xl hover:-translate-y-1 glass-card"
        }
      `}
      onDoubleClick={() => onNavigate(folder.id)}
      onContextMenu={(e) => onContextMenu(e, folder, "folder")}
      title={folder.name}
    >
      <div className="relative transform transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <Folder
          size={72}
          fill={folder.color || FOLDER_COLORS.DEFAULT}
          color={folder.color || FOLDER_COLORS.DEFAULT}
          strokeWidth={1.5}
          className="relative drop-shadow-xl"
        />

        <div
          className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-white/10 shadow-lg bg-bg-panel backdrop-blur-md"
          style={{ color: folder.color || FOLDER_COLORS.DEFAULT }}
        >
          DIR
        </div>

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

export default FolderItem;
