import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Plus, Upload, FolderPlus, ChevronDown, Loader } from "lucide-react";

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
import { DOCUMENT_MODES } from "@/helpers/constants";

const FolderView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { documents, files, selectedId, isLoading } = useSelector((state) => state.documentSystem);

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
        mode: DOCUMENT_MODES.EDIT,
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

  return (
    <div className="relative h-full flex flex-col" onClick={handleClickOutside}>
      <div className="flex items-center justify-between pb-4 border-b border-border-muted -mx-6 px-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-medium text-text-main">{currentFolder?.name}</h2>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-xl text-sm transition-all shadow-lg hover:bg-primary-hover hover:-translate-y-px cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowNewDropdown(!showNewDropdown);
            }}
          >
            <Plus size={18} />
            <span>New</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${showNewDropdown ? "rotate-180" : ""}`}
            />
          </button>

          {showNewDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-bg-panel rounded-xl shadow-2xl border border-border-muted overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              {DROPDOWN_ITEMS.map((item, index) => (
                <button
                  key={index}
                  className="flex items-center gap-3 w-full p-3 text-left hover:bg-bg-hover text-text-main font-medium text-sm cursor-pointer transition-colors"
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

      <Breadcrumb currentFolderId={folderId} />

      {/* Grid View */}
      {isLoading ? (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
          <Loader size={32} className="animate-spin text-primary" />
          <div className="text-text-muted">Loading...</div>
        </div>
      ) : isEmpty ? (
        <EmptyFolderScreen setActiveModal={setActiveModal} />
      ) : (
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-6 py-4">
            {/* Documents */}
            {childDocuments.map((document) => document.docType === "folder" ? (
              <FolderItem
                key={document.id}
                folder={document}
                isSelected={selectedId === document.id}
                onNavigate={handleNavigate}
                onContextMenu={handleContextMenu}
              />
            ): <FileItem
                key={document.id}
                file={document}
                isSelected={selectedId === document.id}
                onSelect={handleSelect}
                onContextMenu={handleContextMenu}
              />)}
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
