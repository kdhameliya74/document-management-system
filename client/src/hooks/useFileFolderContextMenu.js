import { useState } from "react";
import { useDispatch } from "react-redux";
import { Trash, Eye, Share, Download, FolderPen, ArchiveRestore, Trash2 } from "lucide-react";
import { setSelectedId, setShowDetails } from "@/store/documentSystemSlice";
import { TRASH_MENU_ACTIONS } from "@/helpers/constants";

const useFileFolderContextMenu = (menuFor = "dashbaord", onMenuAction) => {
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
  const handleClickOutside = () => {
    dispatch(setSelectedId(null));
    closeContextMenu();
  };

  const openModal = (modalType) => {
    if (contextMenu) {
      updateSelection(contextMenu.item);
    }
    setActiveModal(modalType);
    closeContextMenu();
  };

  const onMenuActionHandler = async (action) => {
    updateSelection(contextMenu.item);

    if (!onMenuAction) return;

    await onMenuAction(contextMenu.item, action);
    updateSelection(null);
  };

  const updateSelection = (item) => {
    setSelectedItem(item);
    setSelectedItemType(item?.type ?? null);
  };

  const getContextMenuItems = () => {
    if (!contextMenu) return [];
    if (menuFor == "trash") {
      return [
        {
          label: "Restore",
          icon: ArchiveRestore,
          onClick: () => onMenuActionHandler(TRASH_MENU_ACTIONS.RESTORE),
        },
        {
          label: "Delete forever",
          icon: Trash2,
          severity: "warning",
          tooltip: "You can not restore once it gets deleted",
          onClick: () => onMenuActionHandler(TRASH_MENU_ACTIONS.DELETE),
        },
      ];
    }
    if (menuFor === "dashbaord") {
      return [
        {
          label: "Edit",
          icon: FolderPen,
          onClick: () => openModal("edit"),
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
    }
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
    handleClickOutside,
  };
};

export default useFileFolderContextMenu;
