import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { deleteDocument, setShowDetails, closeModal } from "@/store/documents.slice";
import { DOCUMENT_MODES, FOLDER_MESSAGES, FILE_MESSAGES } from "@/helpers/constants";
import { Folder, Upload, Trash2, Move, Share2, Edit } from "lucide-react";

import Modal from "@/components/common/Modal";
import FolderModal from "@/components/modals/FolderModal";
import UploadFileModal from "@/components/modals/UploadFileModal";
import DeleteModal from "@/components/modals/DeleteModal";
import MoveModal from "@/components/modals/MoveModal";
import SharingModal from "@/components/modals/SharingModal";
import FileViewer from "@/components/modals/FileViewer";

const ModalManager = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { activeModal, modalProps, currentFolderId, showDetails } = useSelector(
    (state) => state.documentSystem,
  );

  const folderId = location.pathname.split("/")[3]; // TODO: This is a hacky way to get the folder id, we should use react-router-dom to get the folder id
  const MODALS_MAP = useMemo(
    () => ({
      createFolder: {
        Component: FolderModal,
        title: FOLDER_MESSAGES.CREATE_TITLE,
        icon: <Folder className="text-text-muted" />,
        props: { currentFolderId: folderId || currentFolderId },
      },
      upload: {
        Component: UploadFileModal,
        title: FILE_MESSAGES.UPLOAD_TITLE,
        icon: <Upload className="text-text-muted" />,
        props: { currentFolderId: folderId || currentFolderId },
      },
      edit: {
        Component: FolderModal,
        title: FOLDER_MESSAGES.UPDATE_TITLE,
        icon: <Edit className="text-text-muted" />,
        props: {
          currentFolderId: folderId || currentFolderId,
          documentItem: modalProps.item,
          docType: modalProps.itemType,
          mode: DOCUMENT_MODES.UPDATE,
        },
      },
      delete: {
        Component: DeleteModal,
        title: modalProps.itemType === "folder" ? "Delete Folder" : "Delete File",
        icon: <Trash2 className="bg-red-500/10 text-red-500" />,
        props: {
          item: modalProps.item,
          itemType: modalProps.itemType,
          note: "You can restore this item from your Trash folder later if you change your mind.",
          onDelete: async () => await dispatch(deleteDocument(modalProps.item.id)).unwrap(),
          onSuccess: () => {
            if (showDetails) {
              dispatch(setShowDetails(false));
            }
          },
        },
      },
      move: {
        Component: MoveModal,
        title: `Move "${modalProps.item?.name || "Item"}"`,
        icon: <Move size={18} className="text-primary" />,
        props: {
          item: modalProps.item,
        },
      },
      share: {
        Component: SharingModal,
        title: `Share "${modalProps.item?.name}"`,
        icon: <Share2 className="text-text-muted" />,
        props: {
          item: modalProps.item,
        },
      },
    }),
    [currentFolderId, modalProps, dispatch, showDetails, folderId],
  );

  const activeModalConfig = MODALS_MAP[activeModal];

  if (activeModal === "view") {
    return (
      <FileViewer isOpen={true} file={modalProps.item} onClose={() => dispatch(closeModal())} />
    );
  }

  if (!activeModalConfig) return null;

  const { Component, props, title, icon } = activeModalConfig;

  return (
    <Modal isOpen={!!activeModal} onClose={() => dispatch(closeModal())} title={title} icon={icon}>
      <Component {...props} onClose={() => dispatch(closeModal())} />
    </Modal>
  );
};

export default ModalManager;
