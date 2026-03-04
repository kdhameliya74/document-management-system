import { useSelector, useDispatch } from "react-redux";
import { Trash, Eye, Share, Download, FolderPen, Move, ArchiveRestore, Trash2 } from "lucide-react";

import {
  setSelectedId,
  setShowDetails,
  setActiveModal,
  setModalProps,
  setContextMenu,
  clearContextMenu,
} from "@/store/documents.slice";

import { TRASH_MENU_ACTIONS } from "@/helpers/constants";

const useFileFolderContextMenu = (menuFor = "dashboard", onMenuAction) => {
  const dispatch = useDispatch();
  const { contextMenu } = useSelector((state) => state.documentSystem);

  const closeContextMenu = () => dispatch(clearContextMenu());

  const openModal = (modalType) => {
    if (contextMenu) {
      dispatch(
        setModalProps({
          item: contextMenu.item,
          itemType: contextMenu.type,
        }),
      );
    }
    dispatch(setActiveModal(modalType));
    closeContextMenu();
  };

  const onMenuActionHandler = async (action) => {
    if (!onMenuAction || !contextMenu) return;
    await onMenuAction(contextMenu.item, action);
    closeContextMenu();
  };

  const handleContextMenu = (e, item, type) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(setSelectedId(item.id));
    dispatch(
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        item,
        type,
      }),
    );
  };

  const ACTIONS = {
    edit: {
      label: "Edit",
      icon: FolderPen,
      disabled: !contextMenu?.item?.permissions?.canEdit,
      onClick: () => openModal("edit"),
    },
    move: {
      label: "Move",
      icon: Move,
      disabled: !contextMenu?.item?.permissions?.canEdit,
      onClick: () => openModal("move"),
    },
    viewDetails: {
      label: "View Details",
      icon: Eye,
      disabled: !contextMenu?.item?.permissions?.canView,
      onClick: () => {
        dispatch(setShowDetails(true));
        closeContextMenu();
      },
    },
    download: {
      label: "Download",
      icon: Download,
      disabled: !contextMenu?.item?.permissions?.canDownload,
      onClick: () => {
        alert("Download functionality coming soon!");
        closeContextMenu();
      },
    },
    delete: {
      label: "Delete",
      icon: Trash,
      disabled: !contextMenu?.item?.permissions?.canDelete,
      onClick: () => openModal("delete"),
    },
    share: {
      label: "Share",
      icon: Share,
      disabled: !contextMenu?.item?.permissions?.canShare,
      onClick: () => openModal("share"),
    },
    restore: {
      label: "Restore",
      icon: ArchiveRestore,
      onClick: () => onMenuActionHandler(TRASH_MENU_ACTIONS.RESTORE),
    },
    deleteForever: {
      label: "Delete Forever",
      icon: Trash2,
      onClick: () => onMenuActionHandler(TRASH_MENU_ACTIONS.DELETE),
    },
  };

  const MENU_CONFIG = {
    dashboard: ["edit", "move", "share", "download", "viewDetails", "delete"],
    shared: ["edit", "share", "download", "viewDetails"],
    trash: ["restore", "deleteForever"],
  };
  const getContextMenuItems = () => {
    if (!contextMenu) return [];

    const config = MENU_CONFIG[menuFor] || [];

    return config.map((actionKey) => ACTIONS[actionKey]);
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    getContextMenuItems,
  };
};

export default useFileFolderContextMenu;
