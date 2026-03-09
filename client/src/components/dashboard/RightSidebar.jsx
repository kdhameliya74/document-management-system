import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Folder, Download, Move, Trash2, Share2, Clock, Info, User, X } from "lucide-react";
import { deleteItem, setShowDetails } from "@/store/documents.slice";
import { format } from "date-fns";

import FileIcon from "@/components/common/FileIcon";
import DeleteModal from "@/components/modals/DeleteModal";
import { truncateName } from "@/helpers/utils";
import { FOLDER_COLORS } from "@/helpers/constants";

const RightSidebar = () => {
  const dispatch = useDispatch();
  const { documents, currentFolderId, selectedId, showDetails } = useSelector(
    (state) => state.documentSystem,
  );
  const { user } = useSelector((state) => state.auth);

  const currentFolder = documents[currentFolderId];
  const selectedItem = selectedId ? documents[selectedId] : currentFolder;

  const [isDeleting, setIsDeleting] = React.useState(false);

  if (!showDetails || !selectedItem) return null;

  const isFolder = selectedItem.docType === "folder";
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
      <div className="w-[320px] absolute right-0 bg-bg-panel/60 backdrop-blur-xl border-l border-border-main flex flex-col h-full overflow-hidden text-text-main animate-in slide-in-from-right duration-500 z-50">
        <div className="p-5 border-b border-border-muted flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight">
            {truncateName(selectedItem, 20)}
          </h3>
          <button
            onClick={() => dispatch(setShowDetails(false))}
            className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-bg-hover transition-all cursor-pointer"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          <div className="flex flex-col items-center mb-5 text-center">
            <div className="w-[140px] h-[140px] bg-bg-hover rounded-[2.5rem] flex items-center justify-center mb-6 border border-border-main shadow-inner relative group">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-50" />
              {isFolder ? (
                <Folder
                  size={80}
                  fill={selectedItem.color || FOLDER_COLORS.DEFAULT}
                  color={selectedItem.color || FOLDER_COLORS.DEFAULT}
                  strokeWidth={1}
                  className="relative z-10 drop-shadow-2xl"
                />
              ) : (
                <FileIcon
                  mimeType={selectedItem.mimeType}
                  size={80}
                  strokeWidth={1.5}
                  className="text-primary/60 relative z-10 drop-shadow-xl"
                />
              )}
            </div>
            <h4 className="text-lg font-bold mb-1 break-words max-w-full px-2 leading-tight">
              {selectedItem.name}
            </h4>
          </div>

          <div className="flex gap-4">
              edit | download | share | move | delete | view Document 
          </div>


          <div className="flex flex-col gap-4 p-5 rounded-3xl bg-bg-panel/50 border border-border-muted/50">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center text-primary/70">
                <Info size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-dim mb-1">
                  Type
                </span>
                <span className="text-sm font-bold text-text-main uppercase">
                  {isFolder ? "Folder" : selectedItem.extension || "Document"}
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
