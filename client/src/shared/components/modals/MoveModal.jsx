import React, { useState, useEffect, useCallback } from "react";
import { Folder, Search, ChevronRight, ArrowLeft } from "lucide-react";
import DocumentService from "@/features/documents/api/document.api";
import { APP_ROOT_NAME, DEFAULT_MESSAGES } from "@/shared/utils/constants";
import { logError } from "@/shared/utils/utils";
import { useDispatch } from "react-redux";
import { moveDocument } from "@/features/documents/store/documents.slice";
import toast from "react-hot-toast";
import Loading from "@/shared/components/common/Loading";

const MoveModal = ({ onClose, item }) => {
  const [isMoving, setIsMoving] = useState(false);
  const [currentParentId, setCurrentParentId] = useState("root");
  const [foldersCache, setFoldersCache] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: "root", name: APP_ROOT_NAME }]);

  const dispatch = useDispatch();
  const folders = foldersCache[currentParentId] || [];

  const fetchFolders = useCallback(
    async (parentId) => {
      if (foldersCache[parentId]) return;

      setIsLoading(true);
      try {
        const pId = parentId === "root" ? null : parentId;
        const data = await DocumentService.getAll({ parentId: pId, mode: "move" });

        setFoldersCache((prev) => ({
          ...prev,
          [parentId]: data.folders,
        }));
      } catch (error) {
        logError(error);
      } finally {
        setIsLoading(false);
      }
    },
    [foldersCache],
  );

  useEffect(() => {
    fetchFolders(currentParentId);
  }, [currentParentId, fetchFolders]);

  // State is reset on mount/unmount anyway since ModalManager controls rendering
  // but if we want to be explicit:
  useEffect(() => {
    return () => {
      setCurrentParentId("root");
      setSearchQuery("");
      setBreadcrumbs([{ id: "root", name: APP_ROOT_NAME }]);
    };
  }, []);

  const handleNavigate = (folder) => {
    setCurrentParentId(folder.id);
    setBreadcrumbs((prev) => {
      const existingIndex = prev.findIndex((crumb) => crumb.id === folder.id);
      if (existingIndex !== -1) {
        return prev.slice(0, existingIndex + 1);
      }
      return [...prev, { id: folder.id, name: folder.name }];
    });
  };

  const handleBack = () => {
    if (breadcrumbs.length > 1) {
      const parentCrumb = breadcrumbs[breadcrumbs.length - 2];
      setCurrentParentId(parentCrumb.id);
      setBreadcrumbs((prev) => prev.slice(0, -1));
    }
  };

  const filteredFolders = folders.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    const isNotSelf = f.id !== item?.id;
    return (searchQuery ? matchesSearch : true) && isNotSelf;
  });

  const handleMove = async (targetParentId) => {
    try {
      setIsMoving(true);
      const pId = targetParentId === "root" ? null : targetParentId;
      await dispatch(moveDocument({ id: item.id, parentId: pId }));
      toast.success(DEFAULT_MESSAGES.DOCUMENT_MOVE_SUCCESS);
      onClose();
    } catch (error) {
      logError(error);
      toast.error(DEFAULT_MESSAGES.DOCUMENT_MOVE_FAILED);
    } finally {
      setIsMoving(false);
    }
  };

  const currentParent = breadcrumbs[breadcrumbs.length - 1];
  const noFoldersFound = filteredFolders.length === 0 && !isLoading && !isMoving;

  return (
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
              onClick={() => handleNavigate(crumb)}
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

      <div className="flex flex-col min-h-[200px] max-h-[260px] overflow-y-auto pr-1 gap-0.5 custom-scrollbar relative">
        {(isLoading || isMoving) && <Loading />}
        {currentParentId !== "root" && !searchQuery && (
          <button
            onClick={handleBack}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-bg-hover text-text-dim transition-all cursor-pointer group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back</span>
          </button>
        )}

        {filteredFolders.map((folder) => (
          <div
            key={folder.id}
            role="button"
            tabIndex={0}
            onClick={() => folder.hasChildren && handleNavigate(folder)}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && folder.hasChildren) {
                handleNavigate(folder);
              }
            }}
            className={`flex items-center justify-between p-1 rounded-lg text-text-main transition-all group ${
              folder.id === item?.id
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-bg-hover cursor-pointer"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                <Folder
                  size={16}
                  color={folder.color}
                  fill={folder.color || "currentColor"}
                  fillOpacity={0.2}
                />
              </div>
              <span className="text-sm font-medium">{folder.name}</span>
            </div>

            <div className="flex items-center gap-2 group/move">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMove(folder.id);
                }}
                className="text-xs cursor-pointer bg-bg-panel/30 px-2.5 py-1.5 group-hover/move:bg-bg-panel rounded-lg text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                Move
              </button>

              {folder.hasChildren && (
                <ChevronRight
                  size={16}
                  className="text-text-dim opacity-40 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </div>
        ))}

        {noFoldersFound && (
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
            disabled={isMoving}
            onClick={() => handleMove(currentParentId)}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;
