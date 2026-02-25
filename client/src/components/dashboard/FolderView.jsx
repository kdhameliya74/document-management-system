import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Upload, FolderPlus, ChevronDown, Loader } from "lucide-react";
import { DOCUMENT_MODES } from "@/helpers/constants";
import Loading from "@/components/common/Loading";

import ROUTES from "@/utils/routes";
import {
  setCurrentFolder,
  setSelectedId,
  fetchDocuments,
  deleteDocument,
} from "@/store/documentSystemSlice";

import FolderItem from "@/components/dashboard/FolderItem";
import FileItem from "@/components/dashboard/FileItem";
import Breadcrumb from "@/components/dashboard/Breadcrumb";
import ContextMenu from "@/components/common/ContextMenu";
import FolderModal from "@/components/modals/FolderModal";
import UploadFileModal from "@/components/modals/UploadFileModal";
import DeleteModal from "@/components/modals/DeleteModal";
import EmptyFolderScreen from "@/components/dashboard/EmptyFolderScreen";
import useFileFolderContextMenu from "@/hooks/useFileFolderContextMenu";
import ResourceNotFound from "@/components/common/ResourceNotFound";
import toast from "react-hot-toast";

const FolderView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { documents, selectedId, isLoading } = useSelector(
    (state) => state.documentSystem
  );

  const normalizedFolderId = folderId || "root";
  const currentFolder = documents[normalizedFolderId];

  const isInitialLoading = isLoading && !currentFolder;
  const isRefreshing = isLoading && !!currentFolder;

  const [showNewDropdown, setShowNewDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const {
    contextMenu,
    activeModal,
    setActiveModal,
    selectedItem,
    selectedItemType,
    handleContextMenu,
    closeContextMenu,
    getContextMenuItems,
  } = useFileFolderContextMenu();

  /* -------------------- Modals -------------------- */

  const MODALS_MAP = useMemo(
    () => ({
      createFolder: {
        Component: FolderModal,
        props: { currentFolderId: folderId },
      },
      upload: {
        Component: UploadFileModal,
        props: { currentFolderId: folderId },
      },
      edit: {
        Component: FolderModal,
        props: {
          currentFolderId: folderId,
          documentItem: selectedItem,
          docType: selectedItemType,
          mode: DOCUMENT_MODES.UPDATE,
        },
      },
      delete: {
        Component: DeleteModal,
        props: {
          item: selectedItem,
          itemType: selectedItemType,
          note:
            "You can restore this item from your Trash folder later if you change your mind.",
          onDelete: async () =>
            await dispatch(deleteDocument(selectedItem.id)).unwrap(),
        },
      },
    }),
    [folderId, selectedItem, selectedItemType, dispatch]
  );

  const DROPDOWN_ITEMS = useMemo(
    () => [
      {
        label: "New Folder",
        icon: <FolderPlus size={16} />,
        onClick: () => setActiveModal("createFolder"),
      },
      {
        label: "Upload File",
        icon: <Upload size={16} />,
        onClick: () => setActiveModal("upload"),
      },
    ],
    [setActiveModal]
  );

  const ActiveModal = MODALS_MAP[activeModal]?.Component;

  /* -------------------- Fetch Logic -------------------- */

  useEffect(() => {
    const parentId =
      normalizedFolderId === "root" ? null : normalizedFolderId;

    const loadFolder = async () => {
      try {
        await dispatch(fetchDocuments(parentId)).unwrap();
        dispatch(setCurrentFolder(normalizedFolderId));
      } catch (err) {
        toast.error(err);
      }
    };

    loadFolder();
  }, [folderId, dispatch]); // eslint-disable-line

  /* -------------------- Dropdown Close -------------------- */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowNewDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* -------------------- Derived Data -------------------- */

  const childDocuments = useMemo(
    () =>
      currentFolder?.childDocuments
        ?.map((id) => documents[id])
        .filter(Boolean) || [],
    [currentFolder?.childDocuments, documents]
  );

  const isEmpty = childDocuments.length === 0;

  const handleNavigate = (id) => {
    navigate(ROUTES.APP.FOLDER_DYNAMIC(id));
  };

  const handleSelect = (id) => {
    dispatch(setSelectedId(id));
  };

  const handleClickOutsideMain = () => {
    dispatch(setSelectedId(null));
    closeContextMenu();
  };

  /* -------------------- Render Guards -------------------- */

  // 🔥 Full page loader (initial load)
  if (isInitialLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loading text="Refreshing items..."/>
      </div>
    );
  }

  // 🔥 404
  if (!isLoading && !currentFolder) {
    return <ResourceNotFound />;
  }

  const folderName = currentFolder?.name || "";

  /* -------------------- Render -------------------- */

  return (
    <div
      className="relative h-full flex flex-col px-8 py-6"
      onClick={handleClickOutsideMain}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight mb-1 h-9">
            {folderName}
          </h2>
          <p className="text-sm text-text-dim">
            Manage your folders and documents with ease
          </p>
        </div>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2.5 bg-primary text-white py-2.5 px-5 rounded-2xl text-sm font-semibold shadow-lg hover:-translate-y-0.5 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewDropdown(!showNewDropdown);
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${
                showNewDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {showNewDropdown && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-bg-panel rounded-2xl shadow-2xl border border-border-main p-1.5 z-50">
              {DROPDOWN_ITEMS.map((item, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 w-full p-2.5 text-left hover:bg-white/5 rounded-xl text-sm"
                  onClick={() => {
                    item.onClick();
                    setShowNewDropdown(false);
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <Breadcrumb currentFolderId={folderId} />
      </div>
      <div className="flex-1 relative flex flex-col min-h-0">
        {isRefreshing && (
          <Loading text="Refreshing items all..."/>
        )}
        {isEmpty && !isLoading ? (
          <EmptyFolderScreen setActiveModal={setActiveModal} />
        ) : (
          <div className="flex-1 overflow-y-auto -mx-2 px-2 pb-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-5 py-2">
              {childDocuments.map((document) =>
                document.docType === "folder" ? (
                  <FolderItem
                    key={document.id}
                    folder={document}
                    isSelected={selectedId === document.id}
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
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}

      {/* Active Modal */}
      {ActiveModal && (
        <ActiveModal
          {...MODALS_MAP[activeModal]?.props}
          isOpen
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default FolderView;