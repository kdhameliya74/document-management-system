import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedId, getTrashedDocument, restoreDocument, permenantDeleteDocument } from "@/store/documentSystemSlice";
import { truncateFolderName } from "@/helpers/utils.js";
import { TRASH_MENU_ACTIONS, TRASH_MESSAGES } from "@/helpers/constants";

import ROUTES from "@/utils/routes";
import useFileFolderContextMenu from "@/hooks/useFileFolderContextMenu";
import ContextMenu from "@/components/common/ContextMenu";
import FolderItem from "@/components/dashboard/FolderItem";
import FileItem from "@/components/dashboard/FileItem";
import Loading from "@/components/common/Loading";

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
  const location = useLocation();

  const { folderId = "trash" } = useParams();
  const dispatch = useDispatch();

  const { trashDocuments, selectedId, isLoading } = useSelector((state) => state.documentSystem);

  const restoreAction = async (item) => {
    const toastId = toast.loading(TRASH_MESSAGES.RESTORE_LOADING);
    try {
      await dispatch(restoreDocument(item.id)).unwrap();
      toast.success(TRASH_MESSAGES.RESTORE_SUCCESS, {
        id: toastId,
      });
    } catch (err) {
      toast.error(err, {
        id: toastId,
      });
    }
  };

  const deleteAction = async (item) => {
    const toastId = toast.loading(TRASH_MESSAGES.DELETE_LOADING);
    try {
      await dispatch(permenantDeleteDocument(item.id)).unwrap();
      toast.success(TRASH_MESSAGES.DELETE_SUCCESS, {
        id: toastId,
      });
    } catch(err) {
      toast.error(err, {
        id: toastId,
      });
    }
  };
  const contextMenuHandler = async (item, action) => {
    const actionsObject = {
      [TRASH_MENU_ACTIONS.RESTORE]: restoreAction,
      [TRASH_MENU_ACTIONS.DELETE]: deleteAction,
    };
    await actionsObject[action](item);
  };
  const {
    contextMenu,
    handleClickOutside,
    handleContextMenu,
    closeContextMenu,
    getContextMenuItems,
  } = useFileFolderContextMenu("trash", contextMenuHandler);

  /* ---------------------------- derived state ----------------------------- */
  const currentFolder = trashDocuments[folderId];
  const currentPath = currentFolder ? currentFolder?.path?.split("/")?.filter(Boolean) : [];

  const childDocuments = useMemo(() => {
    if (!currentFolder?.childDocuments) return [];
    return currentFolder.childDocuments.map((id) => trashDocuments[id]).filter(Boolean);
  }, [currentFolder, trashDocuments]);

  const isEmpty = childDocuments.length === 0;

  /* ------------------------------ handlers -------------------------------- */
  const handleSelect = (id) => {
    dispatch(setSelectedId(id));
  };

  const handleNavigate = (id) => {
    if (!id) {
      navigate(ROUTES.DASHBOARD.TRASH);
    } else {
      navigate(ROUTES.DASHBOARD.TRASH_DYNAMIC(id));
    }
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
        {childDocuments.map((document) =>
          document.docType === "folder" ? (
            <FolderItem
              key={document.id}
              folder={document}
              isSelected={selectedId === document.id}
              onSelect={handleSelect}
              onNavigate={handleNavigate}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <FileItem
              key={document.id}
              file={document}
              isSelected={selectedId === document.id}
              onSelect={handleSelect}
              onContextMenu={handleContextMenu}
            />
          ),
        )}
      </div>
    </div>
  );

  return (
    <div className="relative h-full flex flex-col" onClick={handleClickOutside}>
      <header className="flex items-center justify-between pb-4 border-b border-border-muted -mx-6 px-6">
        <h2 className="text-2xl font-medium text-text-main">Trash</h2>
      </header>

      <nav className="flex items-center gap-2 text-sm text-text-muted my-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <button
          onClick={() => {
            if (folderId === "trash") {
              goBackHome();
            } else {
              handleNavigate(currentFolder?.parentId);
            }
          }}
          className="p-2 hover:bg-bg-hover hover:text-text-main rounded-full transition-colors cursor-pointer flex items-center"
          title="Go back"
        >
          <ArrowLeft size={16} />
        </button>

        <button
          onClick={() => handleNavigate()}
          className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors cursor-pointer bg-bg-hover text-text-main`}
        >
          <Trash2 size={16} />
          <span>Trash</span>
        </button>
        {currentPath?.length !== 0 &&
          currentPath.map((path, index) => (
            <div className="flex items-center gap-1" key={path}>
              <ChevronRight size={16} className="text-border shrink-0" />
              <span
                className={`text-sm ${index === currentPath.length - 1 ? "text-white border-b" : null}`}
              >
                {truncateFolderName(path)}
              </span>
            </div>
          ))}
      </nav>

      {isLoading && <Loading />}
      {!isLoading && isEmpty && <EmptyTrash onNavigateBack={goBackHome} />}
      {!isLoading && !isEmpty && renderFolders()}

      {contextMenu && location.pathname === ROUTES.DASHBOARD.TRASH && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}
    </div>
  );
};

export default TrashPage;
