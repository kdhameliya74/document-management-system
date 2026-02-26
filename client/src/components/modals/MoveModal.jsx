import React, { useState } from "react";
import { Folder, Search, ChevronRight, ArrowLeft } from "lucide-react";
import Modal from "@/components/common/Modal";
import { FOLDER_COLORS } from "@/helpers/constants";

const SAMPLE_FOLDERS = [
  { id: "root", name: "My Drive", parentId: null, color: FOLDER_COLORS.DEFAULT },
  { id: "1", name: "Project Alpha", parentId: "root", color: FOLDER_COLORS.RED },
  { id: "2", name: "Resources", parentId: "root", color: FOLDER_COLORS.AMBER },
  { id: "3", name: "Final Drafts", parentId: "1", color: FOLDER_COLORS.EMERALD },
  { id: "4", name: "Archive", parentId: "2", color: FOLDER_COLORS.BLUE },
  { id: "5", name: "Project Beta", parentId: "root", color: FOLDER_COLORS.VIOLET },
  { id: "6", name: "Project Gamma", parentId: "root", color: FOLDER_COLORS.PINK },
  { id: "7", name: "Project Delta", parentId: "root", color: FOLDER_COLORS.TEAL },
  { id: "8", name: "Project Epsilon", parentId: "root", color: FOLDER_COLORS.SLATE },
  { id: "9", name: "Project Zeta", parentId: "1", color: FOLDER_COLORS.ORANGE },
  { id: "10", name: "Project Eta", parentId: "1", color: FOLDER_COLORS.YELLOW },
  { id: "11", name: "Project Theta", parentId: "1", color: FOLDER_COLORS.DEFAULT },
  { id: "12", name: "Project Iota", parentId: "1", color: FOLDER_COLORS.RED },
  { id: "13", name: "Project Kappa", parentId: "2", color: FOLDER_COLORS.AMBER },
  { id: "14", name: "Project Lambda", parentId: "2", color: FOLDER_COLORS.EMERALD },
  { id: "15", name: "Project Mu", parentId: "2", color: FOLDER_COLORS.BLUE },
  { id: "16", name: "Project Nu", parentId: "2", color: FOLDER_COLORS.VIOLET },
  { id: "17", name: "Project Xi", parentId: "2", color: FOLDER_COLORS.PINK },
  { id: "18", name: "Project Omicron", parentId: "2", color: FOLDER_COLORS.TEAL },
  { id: "19", name: "Project Pi", parentId: "2", color: FOLDER_COLORS.SLATE },
  { id: "20", name: "Project Rho", parentId: "2", color: FOLDER_COLORS.ORANGE },
  { id: "21", name: "Project Sigma", parentId: "3", color: FOLDER_COLORS.YELLOW },
  { id: "22", name: "Project Tau", parentId: "3", color: FOLDER_COLORS.DEFAULT },
  { id: "23", name: "Project Upsilon", parentId: "3", color: FOLDER_COLORS.RED },
  { id: "24", name: "Project Phi", parentId: "3", color: FOLDER_COLORS.AMBER },
  { id: "25", name: "Project Chi", parentId: "3"  , color: FOLDER_COLORS.EMERALD },
  { id: "26", name: "Project Psi", parentId: "4", color: FOLDER_COLORS.BLUE },
  { id: "27", name: "Project Omega", parentId: "4", color: FOLDER_COLORS.VIOLET },
];

const MoveModal = ({ isOpen, onClose, onMove, item }) => {
  const [currentParentId, setCurrentParentId] = useState("root");
  const [searchQuery, setSearchQuery] = useState("");

  const currentParent = SAMPLE_FOLDERS.find((f) => f.id === currentParentId);
  const breadcrumbs = [];
  let tempId = currentParentId;
  while (tempId) {
    const f = SAMPLE_FOLDERS.find((folder) => folder.id === tempId);
    if (f) {
      breadcrumbs.unshift(f);
      tempId = f.parentId;
    } else {
      tempId = null;
    }
  }

  const filteredFolders = SAMPLE_FOLDERS.filter((f) => {
    const matchesParent = f.parentId === currentParentId;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isNotSelf = f.id !== item?.id;
    return matchesParent && (searchQuery ? matchesSearch : true) && isNotSelf;
  });

  const handleMove = () => {
    onMove(currentParentId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Move "${item?.name || "Item"}"`}
      icon={<Folder size={18} className="text-primary" />}
    >
      <div className="flex flex-col gap-5">
        <div className="relative group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search destination..."
            className="w-full bg-bg-panel/50 border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide border-b border-border-main pb-3">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              {index > 0 && <ChevronRight size={12} className="text-text-dim shrink-0" />}
              <button
                onClick={() => setCurrentParentId(crumb.id)}
                className={`text-xs font-medium px-2 py-0.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  crumb.id === currentParentId
                    ? "text-primary bg-primary/10"
                    : "text-text-dim hover:text-text-main hover:bg-bg-hover"
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-col max-h-[260px] overflow-y-auto pr-1 gap-0.5 custom-scrollbar">
          {currentParentId !== "root" && !searchQuery && (
            <button
              onClick={() => setCurrentParentId(currentParent?.parentId || "root")}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-bg-hover text-text-dim transition-all cursor-pointer group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {filteredFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setCurrentParentId(folder.id)}
              className="flex items-center justify-between p-1 rounded-lg hover:bg-bg-hover text-text-main transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                  <Folder size={16} color={folder.color} fill={folder.color} fillOpacity={0.2} />
                </div>
                <span className="text-sm font-medium">{folder.name}</span>
              </div>
              <ChevronRight size={16} className="text-text-dim group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100 mr-3" />
            </button>
          ))}

          {filteredFolders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 text-text-dim">
              <Folder size={40} strokeWidth={1} className="mb-3 opacity-20" />
              <p className="font-medium text-xs">No folders found</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-main">
          <div className="text-xs">
            <span className="text-text-dim">Moving to: </span>
            <span className="text-text-main font-medium capitalize">{currentParent?.name}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-text-dim hover:bg-bg-hover transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer"
            >
              Move Here
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MoveModal;
