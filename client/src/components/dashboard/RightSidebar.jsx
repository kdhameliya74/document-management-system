import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FileText, Folder, Download, Trash2, Share2, Clock, Info, User, X } from "lucide-react";
import { deleteItem, setShowDetails } from "@/store/documents.slice";
import { format } from "date-fns";

import DeleteModal from "@/components/modals/DeleteModal";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { documents, currentFolderId, selectedId, showDetails } = useSelector(
    (state) => state.documentSystem,
  );
  const { user } = useSelector((state) => state.auth);

  const currentFolder = documents[currentFolderId];
  const selectedItem = selectedId ? documents[selectedId] : currentFolder;

  const [isDeleting, setIsDeleting] = React.useState(false);

  // Only show if showDetails is true AND we have an item to show
  if (!showDetails || !selectedItem) return null;

  const isFolder = !!documents[selectedItem.id];
  const type = isFolder ? "folder" : "file";

  const handleDelete = async () => {
    return new Promise((resolve) => {
      dispatch(
        deleteItem({
          id: selectedItem.id,
          type,
          parentId: selectedItem.parentId,
        }),
      );
      dispatch(setShowDetails(false));
      resolve({ success: true, message: "Item moved to trash" });
    });
  };

  return (
    <>
      <div className="w-[320px] bg-bg-panel/60 backdrop-blur-xl border-l border-border-main flex flex-col h-full overflow-hidden relative text-text-main animate-in slide-in-from-right duration-500">
        <div className="p-7 border-b border-border-muted flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight">
            {isFolder ? "Folder Information" : "File Information"}
          </h3>
          <button
            onClick={() => dispatch(setShowDetails(false))}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-hover transition-all cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-7">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-[140px] h-[140px] bg-bg-hover rounded-[2.5rem] flex items-center justify-center mb-6 border border-border-main shadow-inner relative group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
              {isFolder ? (
                <Folder
                  size={80}
                  fill="#6366f1"
                  color="#6366f1"
                  strokeWidth={1}
                  className="relative z-10 drop-shadow-2xl"
                />
              ) : (
                <FileText
                  size={80}
                  className="text-primary/60 relative z-10 drop-shadow-xl"
                  strokeWidth={1.5}
                />
              )}
            </div>
            <h4 className="text-lg font-bold mb-1 break-words max-w-full px-2 leading-tight">
              {selectedItem.name}
            </h4>
            <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest border border-primary/20">
              {isFolder ? "Folder" : selectedItem.type || "Document"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border-muted bg-bg-panel/50 hover:bg-bg-hover hover:border-primary/50 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center text-text-dim group-hover:text-primary transition-colors">
                <Download size={20} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-text-muted group-hover:text-text-main">
                Download
              </span>
            </button>
            <button className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-border-muted bg-bg-panel/50 hover:bg-bg-hover hover:border-primary/50 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-bg-hover flex items-center justify-center text-text-dim group-hover:text-primary transition-colors">
                <Share2 size={20} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-text-muted group-hover:text-text-main">
                Share
              </span>
            </button>
          </div>

          <div className="flex flex-col gap-6 p-6 rounded-3xl bg-bg-panel/50 border border-border-muted/50">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center text-primary/70">
                <Info size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-dim mb-1">
                  Type
                </span>
                <span className="text-sm font-bold text-text-main">
                  {isFolder ? "Folder" : selectedItem.type || "Document"}
                </span>
              </div>
            </div>

            {!isFolder && (
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center text-primary/70">
                  <Info size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-dim mb-1">
                    Size
                  </span>
                  <span className="text-sm font-bold text-text-main">
                    {selectedItem.size ? `${(selectedItem.size / 1024).toFixed(2)} KB` : "N/A"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center text-primary/70">
                <Clock size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-dim mb-1">
                  Created
                </span>
                <span className="text-sm font-bold text-text-main">
                  {selectedItem.createdAt
                    ? format(new Date(selectedItem.createdAt), "MMM d, yyyy")
                    : "No Date"}
                </span>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center text-primary/70">
                <User size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-dim mb-1">
                  Owner
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                    {user?.name?.charAt(0) || "M"}
                  </div>
                  <span className="text-sm font-bold text-text-main">{user?.name || "Me"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedItem.id !== "root" && (
          <div className="p-7 border-t border-border-muted">
            <button
              className="w-full flex items-center justify-center gap-2 py-4 px-6 border border-red-500/30 rounded-2xl font-bold text-sm transition-all duration-300 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 shadow-sm cursor-pointer"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 size={18} strokeWidth={2.5} />
              <span>Move to Trash</span>
            </button>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onDelete={handleDelete}
        item={selectedItem}
      />
    </>
  );
};

export default RightSidebar;
