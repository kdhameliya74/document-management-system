import React, { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { Trash2, ArrowLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  setSelectedId,
  restoreDocument,
  permenantDeleteDocument,
  fetchDocuments,
} from "@/store/documents.slice";

import { truncateFolderName } from "@/helpers/utils.js";
import { APP_VIEWS_MAP, TRASH_MENU_ACTIONS, TRASH_MESSAGES } from "@/helpers/constants";
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
  /* ------------------------------- hooks -------------------------------- */
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { folderId = "trash" } = useParams();

  const { documents, selectedId, isLoading } = useSelector((state) => state.documentSystem);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  /* --------------------------- derived states ---------------------------- */

  const currentFolder = documents[folderId] ?? null;

  const hasLoadedFolder = Boolean(currentFolder);

  const isInitialLoading = isLoading && !hasLoadedFolder;
  const isRefreshing = isLoading && hasLoadedFolder;

  const childDocuments = useMemo(() => {
    if (!currentFolder?.childDocuments) return [];

    return currentFolder.childDocuments.map((id) => documents[id]).filter(Boolean);
  }, [currentFolder, documents]);

  const isEmpty = hasLoadedFolder && childDocuments.length === 0;

  const currentPath = useMemo(() => {
    if (!currentFolder?.path) return [];
    return currentFolder.path.split("/").filter(Boolean);
  }, [currentFolder]);

  /* ------------------------------ actions -------------------------------- */

  const handleAsyncAction = useCallback(
    async ({ item, asyncAction, loadingMessage, successMessage }) => {
      const toastId = toast.loading(loadingMessage);

      try {
        await dispatch(asyncAction(item.id)).unwrap();
        toast.success(successMessage, { id: toastId });
      } catch (err) {
        toast.error(err, { id: toastId });
      }
    },
    [dispatch],
  );

  const contextMenuHandler = useCallback(
    async (item, action) => {
      const actionsMap = {
        [TRASH_MENU_ACTIONS.RESTORE]: () =>
          handleAsyncAction({
            item,
            asyncAction: restoreDocument,
            loadingMessage: TRASH_MESSAGES.RESTORE_LOADING,
            successMessage: TRASH_MESSAGES.RESTORE_SUCCESS,
          }),

        [TRASH_MENU_ACTIONS.DELETE]: () => {
          setSelectedItem(item);
          setIsDeleteModalOpen(true);
        },
      };

      await actionsMap[action]?.();
    },
    [handleAsyncAction],
  );

  const {
    contextMenu,
    handleClickOutside,
    handleContextMenu,
    closeContextMenu,
    getContextMenuItems,
  } = useFileFolderContextMenu("trash", contextMenuHandler);

  /* ------------------------------ handlers ------------------------------- */

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

  /* ------------------------------- effects -------------------------------- */

  useEffect(() => {
    const parentId = folderId === APP_VIEWS_MAP.TRASH ? null : folderId;

    const loadTrash = async () => {
      try {
        await dispatch(
          fetchDocuments({
            parentId,
            mode: APP_VIEWS_MAP.TRASH,
          }),
        ).unwrap();
      } catch (err) {
        toast.error(err);
      }
    };

    loadTrash();
  }, [folderId, dispatch]);

  /* ---------------------------- render items ----------------------------- */

  const renderItems = () => (
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
              onDoubleClick={() => {
                dispatch(setModalProps({ item: document, itemType: "file", source: "trash" }));
                dispatch(setActiveModal("view"));
              }}
            />
          ),
        )}
      </div>
    </div>
  );

  /* --------------------------- loading states ---------------------------- */

  if (isInitialLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading text="Loading trash..." />
      </div>
    );
  }

  if (!isLoading && !currentFolder) {
    return <ResourceNotFound />;
  }

  /* -------------------------------- render -------------------------------- */

  return (
    <>
      <div className="relative h-full flex flex-col px-8 py-6" onClick={handleClickOutside}>
        <PageHeader>
          <PageHeader.Left title="Trash" subtitle="Manage your trashed folders and documents" />
        </PageHeader>

        {/* Breadcrumb */}

        <nav className="flex items-center gap-2 text-sm text-text-muted my-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button
            onClick={() => {
              if (folderId === "trash") {
                goBackHome();
              } else {
                handleNavigate(currentFolder?.parentId);
              }
            }}
            className="p-2 hover:bg-bg-hover rounded-full"
          >
            <ArrowLeft size={16} />
          </button>

          <button
            onClick={() => handleNavigate()}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-bg-hover"
          >
            <Trash2 size={16} />
            <span>Trash</span>
          </button>

          {currentPath.map((path, index) => (
            <div className="flex items-center gap-1" key={path}>
              <ChevronRight size={16} className="text-border shrink-0" />

              <span
                className={`text-sm ${
                  index === currentPath.length - 1 ? "text-white border-b" : ""
                }`}
              >
                {truncateFolderName(path)}
              </span>
            </div>
          ))}
        </nav>

        {/* Refresh loader */}

        {isRefreshing && <Loading text="Refreshing items..." />}

        {/* Empty state */}

        {!isLoading && isEmpty && (
          <EmptyState
            icon={<Trash2 />}
            title={folderId === "trash" ? "Trash is empty" : "This folder is empty"}
            description={
              folderId === "trash"
                ? "Items moved to trash appear here."
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

        {/* Items */}

        {!isLoading && !isEmpty && renderItems()}

        {/* Context Menu */}

        {contextMenu && location.pathname.startsWith(ROUTES.APP.TRASH) && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            items={getContextMenuItems()}
            onClose={closeContextMenu}
          />
        )}
      </div>

      {/* Delete Modal */}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        deleteText="Delete forever"
        title="Delete forever?"
        item={selectedItem}
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
      >
        <DeleteModal.Body>
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
            <p className="text-text-main text-base leading-relaxed">
              {selectedItem?.name && (
                <span className="font-medium text-red-400">"{selectedItem?.name}"</span>
              )}{" "}
              will be deleted forever. This action cannot be undone.
            </p>
          </div>
        </DeleteModal.Body>
      </DeleteModal>
    </>
  );
};

export default TrashPage;
