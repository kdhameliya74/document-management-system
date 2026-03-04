import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setActiveModal, deleteDocument } from "@/store/documents.slice";
import { DOCUMENT_MODES } from "@/helpers/constants";

import FolderModal from "@/components/modals/FolderModal";
import UploadFileModal from "@/components/modals/UploadFileModal";
import DeleteModal from "@/components/modals/DeleteModal";
import MoveModal from "@/components/modals/MoveModal";
import SharingModal from "@/components/modals/SharingModal";

const ModalManager = () => {
  const dispatch = useDispatch();
  const { activeModal, modalProps, currentFolderId } = useSelector((state) => state.documentSystem);

  const MODALS_MAP = useMemo(
    () => ({
      createFolder: {
        Component: FolderModal,
        props: { currentFolderId },
      },
      upload: {
        Component: UploadFileModal,
        props: { currentFolderId },
      },
      edit: {
        Component: FolderModal,
        props: {
          currentFolderId,
          documentItem: modalProps.item,
          docType: modalProps.itemType,
          mode: DOCUMENT_MODES.UPDATE,
        },
      },
      delete: {
        Component: DeleteModal,
        props: {
          item: modalProps.item,
          itemType: modalProps.itemType,
          note: "You can restore this item from your Trash folder later if you change your mind.",
          onDelete: async () => await dispatch(deleteDocument(modalProps.item.id)).unwrap(),
        },
      },
      move: {
        Component: MoveModal,
        props: {
          item: modalProps.item,
        },
      },
      share: {
        Component: SharingModal,
        props: {
          item: modalProps.item,
        },
      },
    }),
    [currentFolderId, modalProps, dispatch],
  );

  const activeModalConfig = MODALS_MAP[activeModal];
  if (!activeModalConfig) return null;

  const { Component, props } = activeModalConfig;

  return (
    <Component
      {...props}
      isOpen={!!activeModal}
      onClose={() => dispatch(setActiveModal(null))}
    />
  );
};

export default ModalManager;
