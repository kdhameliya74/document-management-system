import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Upload, FolderPlus, ChevronDown, Loader } from "lucide-react";
import { DOCUMENT_MODES } from "@/helpers/constants";

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

const FolderView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { documents, selectedId, isLoading } = useSelector((state) => state.documentSystem);

  const currentFolder = documents[folderId];

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

  // TODO: Think of different name for `currentFolderId`
  const MODALS_MAP = {
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
        currentFolderId: folderId, // root folder Id
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
        note: "You can restore this item from your Trash folder later if you change your mind.",
        onDelete: async () => await dispatch(deleteDocument(selectedItem.id)).unwrap(),
      },
    },
  };

  const DROPDOWN_ITEMS = [
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
  ];

  const ActiveModal = MODALS_MAP[activeModal]?.Component;

  useEffect(() => {
    // fetch documents and files
    // if (!folderId || !currentFolder) return; //TODO: need to fix this
    const parentId = folderId === "root" ? null : folderId;
    dispatch(fetchDocuments(parentId));
    dispatch(setCurrentFolder(folderId));
  }, [folderId, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNewDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const childDocuments =
    currentFolder?.childDocuments.map((id) => documents[id]).filter(Boolean) || [];

  const isEmpty = childDocuments.length === 0;

  const handleNavigate = (id) => {
    navigate(ROUTES.DASHBOARD.FOLDER_DYNAMIC(id));
  };

  const handleSelect = (id) => {
    dispatch(setSelectedId(id));
  };

  const handleClickOutside = () => {
    dispatch(setSelectedId(null));
    closeContextMenu();
  };

  if (!folderId || !currentFolder) {
    return <ResourceNotFound />;
  }

  return (
    <div className="relative h-full flex flex-col px-8 py-6" onClick={handleClickOutside}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-main tracking-tight mb-1">
            {currentFolder?.name === "root" ? "My Drive" : currentFolder?.name}
          </h2>
          <p className="text-sm text-text-dim">
            Manage your folders and documents with ease
          </p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2.5 bg-primary text-white py-2.5 px-5 rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 hover:bg-primary-hover hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewDropdown(!showNewDropdown);
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>New</span>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showNewDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showNewDropdown && (
            <div className="absolute top-full right-0 mt-3 w-56 bg-bg-panel rounded-2xl shadow-2xl border border-border-main overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 p-1.5 glass-panel">
              {DROPDOWN_ITEMS.map((item, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 w-full p-2.5 text-left hover:bg-white/5 rounded-xl text-text-main font-medium text-sm cursor-pointer transition-colors group"
                  onClick={() => {
                    item.onClick();
                    setShowNewDropdown(false);
                  }}
                >
                  <div className="w-8 h-8 rounded-lg bg-bg-hover flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    {item.icon}
                  </div>
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

      {/* Grid View */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <div className="text-text-muted font-medium animate-pulse">Loading items...</div>
        </div>
      ) : isEmpty ? (
        <EmptyFolderScreen setActiveModal={setActiveModal} />
      ) : (
        <div className="flex-1 overflow-y-auto min-h-0 -mx-2 px-2 pb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 2xl:grid-cols-9 gap-5 py-2">
            {/* Documents */}
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
              ),
            )}
          </div>
        </div>
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={getContextMenuItems()}
          onClose={closeContextMenu}
        />
      )}

      {ActiveModal && (
        <ActiveModal
          {...MODALS_MAP[activeModal]?.props}
          isOpen={true}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
};

export default FolderView;
