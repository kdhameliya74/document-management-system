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
import { APP_VIEWS_MAP, TRASH_MENU_ACTIONS } from "@/helpers/constants";

const useFileFolderContextMenu = (menuFor = "dashbaord", onMenuAction) => {
  const dispatch = useDispatch();
  const { contextMenu } = useSelector((state) => state.documentSystem);

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
    if (!onMenuAction) return;
    await onMenuAction(contextMenu.item, action);
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
          onClick: () => onMenuActionHandler(TRASH_MENU_ACTIONS.DELETE),
        },
      ];
    }
    if (menuFor === "share") {
      return [
        {
          label: "Edit",
          icon: FolderPen,
          onClick: () => openModal("edit"),
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
          label: "Download",
          icon: Download,
          onClick: () => {
            alert("Download functionality coming soon!");
            closeContextMenu();
          },
        },
        {
          label: "Delete",
          icon: Trash,
          onClick: () => openModal("delete"),
        },
      ];
    }
    if (menuFor === "dashbaord" || menuFor === APP_VIEWS_MAP.SHARED) {
      const items = [
        {
          label: "Edit",
          icon: FolderPen,
          onClick: () => openModal("edit"),
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
          label: "Download",
          icon: Download,
          onClick: () => {
            alert("Download functionality coming soon!");
            closeContextMenu();
          },
        },
        {
          label: "Delete",
          icon: Trash,
          onClick: () => openModal("delete"),
        },
      ];

      if (menuFor === "dashbaord") {
        items.splice(
          1,
          0,
          {
            label: "Move",
            icon: Move,
            onClick: () => openModal("move"),
          },
          {
            label: "Share",
            icon: Share,
            onClick: () => openModal("share"),
          },
        );
      }

      return items;
    }
  };

  return {
    contextMenu,
    handleContextMenu,
    closeContextMenu,
    getContextMenuItems,
  };
};

export default useFileFolderContextMenu;
