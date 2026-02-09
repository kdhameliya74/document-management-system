import React, { useEffect, useMemo } from "react";
import { Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import ROUTES from "@/utils/routes";
import { setSelectedId, getTrashedDocument } from "@/store/documentSystemSlice";

import FolderItem from "@/components/dashboard/FolderItem";
import Loading from "@/components/common/Loading";
import { truncateFolderName } from "@/helpers/utils.js";

const EmptyTrash = ({ onNavigateBack, folderId }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center">
    <div className="w-32 h-32 rounded-full flex items-center justify-center mb-6 bg-bg-panel">
      <Trash2 size={64} className="text-primary/50" />
    </div>
    {folderId === "trash" ? (
      <>
        <h3 className="text-xl font-normal text-text-main mb-2">Trash is empty</h3>
        <p>Items moved to trash will appear here</p>
        <button
          onClick={onNavigateBack}
          className="mt-6 flex text-sm items-center gap-2 py-2 cursor-pointer px-3 rounded-lg transition-all bg-primary text-white hover:bg-primary-hover shadow-md"
        >
          <ArrowLeft size={18} />
          <span>Go to My Drive</span>
        </button>
      </>
    ) : (
      <>
        <h3 className="text-xl font-normal text-text-main mb-2">This folder is empty</h3>
        <p>There are no files or folders here.</p>
      </>
    )}
  </div>
);

const TrashPage = () => {
  /* -------------------------------- hooks -------------------------------- */
  const navigate = useNavigate();
  const { folderId = "trash" } = useParams();
  const dispatch = useDispatch();

  const { trashDocuments, selectedId, isLoading } = useSelector((state) => state.documentSystem);

  /* ---------------------------- derived state ----------------------------- */
  const currentFolder = trashDocuments[folderId];
  const currentPath = currentFolder ? currentFolder?.path?.split("/")?.filter(Boolean) : [];

  const childDocuments = useMemo(() => {
    if (!currentFolder?.childFolderIds) return [];
    return currentFolder.childFolderIds.map((id) => trashDocuments[id]).filter(Boolean);
  }, [currentFolder, trashDocuments]);

  const isEmpty = childDocuments.length === 0;

  /* ------------------------------ handlers -------------------------------- */
  const handleSelect = (id) => {
    dispatch(setSelectedId(id));
  };

  const handleNavigate = (id) => {
    navigate(ROUTES.DASHBOARD.TRASH_DYNAMIC(id));
  };

  const goBackHome = () => navigate(ROUTES.DASHBOARD.FOLDER_ROOT);

  /* -------------------------------- effects ------------------------------- */
  useEffect(() => {
    const parentId = folderId === "trash" ? null : folderId;
    dispatch(getTrashedDocument(parentId));
  }, [folderId, dispatch]);

  const renderFolders = () => (
    <div className="flex-1 overflow-y-auto -mx-6 px-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-6 py-4">
        {childDocuments.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            isSelected={selectedId === folder.id}
            onSelect={handleSelect}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="relative h-full flex flex-col">
      <header className="flex items-center justify-between pb-4 border-b border-border-muted -mx-6 px-6">
        <h2 className="text-2xl font-medium text-text-main">Trash</h2>
      </header>

      <nav className="flex items-center gap-2 text-sm text-text-muted my-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => {
            if (folderId === "trash") {
              goBackHome();
            } else {
              handleNavigate(currentFolder?.parentId || "trash");
            }
          }}
          className="p-2 hover:bg-bg-hover hover:text-text-main rounded-full transition-colors cursor-pointer flex items-center"
          title="Go back"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={() => handleNavigate("trash")}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer bg-bg-hover text-text-main`}
        >
          <Trash2 size={16} />
          <span>Trash</span>
        </button>
        {currentPath?.length !== 0 &&
          currentPath.map((path) => (
            <div className="flex items-center gap-1" key={path}>
              <ChevronRight size={16} className="text-border shrink-0" />
              <span className="text-sm">{truncateFolderName(path)}</span>
            </div>
          ))}
      </nav>

      {isLoading && <Loading />}
      {!isLoading && isEmpty && <EmptyTrash onNavigateBack={goBackHome} />}
      {!isLoading && !isEmpty && renderFolders()}
    </div>
  );
};

export default TrashPage;
