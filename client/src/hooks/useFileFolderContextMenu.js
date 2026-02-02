import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Trash, Eye, Share, Download, FolderPen } from "lucide-react";
import { setSelectedId, setShowDetails } from "@/store/fileSystemSlice";

const useFileFolderContextMenu = () => {
  const dispatch = useDispatch();
  const [contextMenu, setContextMenu] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setSelectedId(item.id));
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  const openModal = (modalType) => {
    if (contextMenu) {
      setSelectedItem(contextMenu.item);
      setSelectedItemType(contextMenu.type);
    }
    setActiveModal(modalType);
    closeContextMenu();
  };

  const getContextMenuItems = () => {
    if (!contextMenu) return [];
    return [
      {
        label: "Rename",
        icon: FolderPen,
        onClick: () => openModal("rename"),
      },
      {
        label: "Delete",
        icon: Trash,
        onClick: () => openModal("delete"),
      },
      {
        label: "View Details",
        icon: Eye,
        onClick: () => {
          dispatch(setShowDetails(true));
          closeContextMenu();
        },
      },
      {
        label: "Share",
        icon: Share,
        onClick: () => {
          alert("Share functionality coming soon!");
          closeContextMenu();
        },
      },
      {
        label: "Download",
        icon: Download,
        onClick: () => {
          alert("Download functionality coming soon!");
          closeContextMenu();
        },
      },
    ];
  };

  return {
    contextMenu,
    activeModal,
    setActiveModal,
    selectedItem,
    selectedItemType,
    handleContextMenu,
    closeContextMenu,
    getContextMenuItems,
  };
};

export default useFileFolderContextMenu;
