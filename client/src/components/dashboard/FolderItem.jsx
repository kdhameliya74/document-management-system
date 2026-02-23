import React from "react";
import { Folder, LoaderCircle } from "lucide-react";
import { FOLDER_COLORS } from "@/helpers/constants.js";
import { truncateFolderName } from "@/helpers/utils.js";

const FolderItem = ({ folder, isSelected, onNavigate, onContextMenu }) => {
  const displayName = truncateFolderName(folder.name);

  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all group border-2 ${
        isSelected
          ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/10"
          : "border-transparent hover:bg-bg-hover hover:border-border-muted"
      }`}
      onDoubleClick={() => onNavigate(folder.id)}
      onContextMenu={(e) => onContextMenu(e, folder, "folder")}
      title={folder.name}
    >
      <div className="relative">
        <Folder
          size={64}
          fill={folder.color || FOLDER_COLORS.DEFAULT}
          color={folder.color || FOLDER_COLORS.DEFAULT}
          strokeWidth={1}
          className="transition-transform group-hover:scale-105"
        />
      </div>
      <span
        className={`text-sm text-center break-all line-clamp-2 px-1 select-none ${
          isSelected ? "text-primary" : "text-text-main"
        }`}
      >
        {displayName}
      </span>
    </div>
  );
};

export default FolderItem;
