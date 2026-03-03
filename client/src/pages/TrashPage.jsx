import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedId,
  getTrashedDocument,
  restoreDocument,
  permenantDeleteDocument,
} from "@/store/documentSystemSlice";
import { truncateFolderName } from "@/helpers/utils.js";
import { TRASH_MENU_ACTIONS, TRASH_MESSAGES } from "@/helpers/constants";

import ROUTES from "@/utils/routes";
import useFileFolderContextMenu from "@/hooks/useFileFolderContextMenu";
import ContextMenu from "@/components/common/ContextMenu";
import FolderItem from "@/components/dashboard/FolderItem";
import FileItem from "@/components/dashboard/FileItem";
import Loading from "@/components/common/Loading";
import DeleteModal from "@/components/modals/DeleteModal";
import ResourceNotFound from "@/components/common/ResourceNotFound";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";


const TrashPage = () => {
  /* -------------------------------- hooks -------------------------------- */
  const navigate = useNavigate();
  const location = useLocation();

  const { folderId = "trash" } = useParams();
  const dispatch = useDispatch();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { trashDocuments, selectedId, isLoading } = useSelector((state) => state.documentSystem);

  const handleAsyncAction = async ({ item, asyncAction, loadingMessage, successMessage }) => {
    const toastId = toast.loading(loadingMessage);

    try {
      await dispatch(asyncAction(item.id)).unwrap();
      toast.success(successMessage, { id: toastId });
    } catch (err) {
      toast.error(err, { id: toastId });
    }
  };

  const contextMenuHandler = async (item, action) => {
    const actionsMap = {
      [TRASH_MENU_ACTIONS.RESTORE]: () =>
        handleAsyncAction({
          item,
          asyncAction: restoreDocument,
          loadingMessage: TRASH_MESSAGES.RESTORE_LOADING,
          successMessage: TRASH_MESSAGES.RESTORE_SUCCESS,
        }),

      [TRASH_MENU_ACTIONS.DELETE]: () => {
        setIsDeleteModalOpen(true);
        setSelectedItem(item);
      },
    };

    await actionsMap[action]?.();
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
      navigate(ROUTES.APP.TRASH);
    } else {
      navigate(ROUTES.APP.TRASH_DYNAMIC(id));
    }
  };

  const goBackHome = () => navigate(ROUTES.APP.FOLDERS);

  /* -------------------------------- effects ------------------------------- */
  useEffect(() => {
    const parentId = folderId === "trash" ? null : folderId;
    const loadTrash = async () => {
      try {
        await dispatch(getTrashedDocument(parentId)).unwrap();
      } catch (err) {
        toast.error(err);
      }
    };
    loadTrash();
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

  if (!isLoading && !currentFolder) {
    return <ResourceNotFound />;
  }

  return (
    <>
      <div className="relative h-full flex flex-col px-8 py-6" onClick={handleClickOutside}>
        <PageHeader>
          <PageHeader.Left
            title={"Trash"}
            subtitle="Manage your trashed folders and documents with ease"
          />
        </PageHeader>

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
        {!isLoading && isEmpty && (
          <EmptyState
            icon={<Trash2 />}
            title={folderId === "trash" ? "Trash is empty" : "This folder is empty"}
            description={
              folderId === "trash"
                ? "Items moved to trash will appear here. They will be permanently deleted after 30 days."
                : "There are no files or folders here."
            }
            actions={
              folderId === "trash"
                ? [
                    {
                      label: "Go to My Drive",
                      onClick: goBackHome,
                    },
                  ]
                : []
            }
          />
        )}
        {!isLoading && !isEmpty && renderFolders()}

        {contextMenu && location.pathname.startsWith(ROUTES.APP.TRASH) && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={getContextMenuItems()}
            onClose={closeContextMenu}
          />
        )}
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        deleteText="Delete forever"
        title="Delete forever?"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onDelete={() =>
          handleAsyncAction({
            item: selectedItem,
            asyncAction: permenantDeleteDocument,
            loadingMessage: TRASH_MESSAGES.DELETE_LOADING,
            successMessage: TRASH_MESSAGES.DELETE_SUCCESS,
          })
        }
        item={selectedItem}
      >
        <DeleteModal.Body>
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
            <p className="text-text-main text-base leading-relaxed">
              {selectedItem?.name && (
                <span className="font-medium text-red-400">"{selectedItem?.name}" </span>
              )}{" "}
              will be deleted forever. This action cannot be undone!
            </p>
          </div>
        </DeleteModal.Body>
      </DeleteModal>
    </>
  );
};

export default TrashPage;
