import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Folder, Loader, Edit } from "lucide-react";
import { FOLDER_COLORS, FOLDER_MESSAGES, DOCUMENT_MODES } from "@/helpers/constants.js";

import { createFolder, updateDocument } from "@/store/documentSystemSlice";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";
import { getBaseName, getFileExtension, logError, getDocumentFlags } from "@/helpers/utils";

const FolderModal = ({
  documentItem,
  isOpen,
  onClose,
  currentFolderId,
  mode = DOCUMENT_MODES.CREATE,
}) => {
  const { isCreate, isUpdate, isFolder, isFile } = getDocumentFlags(mode, documentItem?.docType);
  const parentFolderId = currentFolderId === "root" ? null : currentFolderId;

  const modalProps = {
    title: isCreate ? FOLDER_MESSAGES.CREATE_TITLE : FOLDER_MESSAGES.UPDATE_TITLE,
    icon: isCreate ? <Folder className="text-text-muted" /> : <Edit className="text-text-muted" />,
  };

  const [isLoading, setIsLoading] = useState(false);
  const getInitialFileName = () => {
    if (!documentItem?.name) return "";
    return isFolder ? documentItem.name : getBaseName(documentItem.name);
  };
  const [folderName, setFolderName] = useState(getInitialFileName);
  const extension = isFile && isUpdate && getFileExtension(documentItem?.name);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(documentItem?.color || FOLDER_COLORS.DEFAULT);
  const { documents } = useSelector((state) => state.documentSystem);

  const dispatch = useDispatch();

  const isDuplicateName = (name) => {
    const sanitized = name.trim().toLowerCase();
    const currentFolder = documents[currentFolderId];

    return currentFolder?.childDocuments?.some(
      (docId) => documents[docId]?.name.toLowerCase() === sanitized,
    );
  };

  const saveNewFolder = async () => {
    const fields = {
      name: folderName.trim(),
      color: selectedColor,
    };

    await dispatch(
      createFolder({
        ...fields,
        parentId: parentFolderId,
      }),
    ).unwrap();
  };

  const updateFolder = async () => {
    const fields = {
      name: folderName.trim(),
      color: selectedColor,
    };
    await dispatch(updateDocument({ ...fields, id: documentItem.id })).unwrap();
  };

  const updateFile = async () => {
    const fields = {
      name: `${folderName.trim()}.${extension}`,
    };

    await dispatch(updateDocument({ ...fields, id: documentItem.id })).unwrap();
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const sanitizedName = folderName.trim();
      if (!sanitizedName) return;

      if (isDuplicateName(sanitizedName)) {
        setErrorMessage(FOLDER_MESSAGES.NAME_DUPLICATE);
        return;
      }

      if (isCreate) {
        await saveNewFolder();
        toast.success(FOLDER_MESSAGES.CREATE_SUCCESS);
      } else {
        if (isFolder) {
          await updateFolder();
        } else {
          await updateFile();
        }
        toast.success(FOLDER_MESSAGES.UPDATE_SUCCESS);
      }
      handleCancel();
    } catch (err) {
      toast.error(FOLDER_MESSAGES.DOCUMENT_SAVE_FAILED);
      logError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFolderName("");
    setSelectedColor(FOLDER_COLORS.DEFAULT);
    setErrorMessage(null);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && folderName.trim()) {
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} {...modalProps}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label htmlFor="folder_name" className="text-sm text-text-muted px-1">
            Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="folder_name"
              placeholder="e.g. Projects, Invoices, Photos"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={`w-full py-2 px-4 rounded-xl bg-bg-main text-text-main text-base outline-none border transition-all shadow-inner ${
                errorMessage
                  ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-border-muted focus:border-primary focus:ring-4 focus:ring-primary/10"
              } ${isFile && extension ? "pr-16" : ""}`}
            />
            {isFile && extension && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-bg-hover rounded-lg text-[10px] font-bold text-text-muted border border-border-muted uppercase tracking-wider pointer-events-none select-none">
                {extension}
              </div>
            )}
          </div>
          {errorMessage && <span className="text-sm text-red-500 px-1">{errorMessage}</span>}
        </div>

        {(isFolder || isCreate) && (
          <div className="flex flex-col gap-3">
            <label className="text-sm text-text-muted px-1">Choose folder Color</label>
            <div className="grid grid-cols-9 gap-2">
              {Object.values(FOLDER_COLORS).map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all transform hover:scale-110 cursor-pointer border-2 ${
                    selectedColor === color
                      ? "border-white scale-110 shadow-lg shadow-white/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={handleCancel}
            className="py-2.5 px-5 rounded-xl font-normal text-sm transition-all bg-bg-hover text-text-muted hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !folderName.trim()}
            className="flex gap-2 py-2.5 px-5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? <Loader className="animate-spin" size={18} /> : null}
            <span>{"Save"}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default FolderModal;
