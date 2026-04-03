import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "lucide-react";
import { FOLDER_COLORS, FOLDER_MESSAGES, DOCUMENT_MODES } from "@/helpers/constants.js";

import { createFolder, updateDocument } from "@/store/documents.slice";
import toast from "react-hot-toast";
import { getBaseName, getFileExtension, getDocumentFlags } from "@/helpers/utils";

const FolderModal = ({ documentItem, onClose, currentFolderId, mode = DOCUMENT_MODES.CREATE }) => {
  const { isCreate, isUpdate, isFolder, isFile } = getDocumentFlags(mode, documentItem?.docType);
  const parentFolderId = currentFolderId === "root" ? null : currentFolderId;

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
      (docId) =>
        documents[docId]?.name.toLowerCase() === sanitized &&
        documents[docId]?.id !== documentItem?.id,
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
      toast.error(err);
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
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="folder_name"
          className="text-sm font-bold text-text-muted px-1 uppercase tracking-wider"
        >
          Display Name
        </label>
        <div className="relative group">
          <input
            type="text"
            id="folder_name"
            placeholder="e.g. Design Projects"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className={`w-full py-3.5 px-5 rounded-2xl bg-bg-panel text-text-main text-base font-medium outline-none border transition-all duration-300 shadow-inner group-hover:border-border-muted ${
              errorMessage
                ? "border-red-500/50 focus:border-red-500 focus:ring-4 focus:ring-red-500/5"
                : "border-border-main focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
            } ${isFile && extension ? "pr-20" : ""}`}
          />
          {isFile && extension && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-bg-hover rounded-xl text-[10px] font-black text-text-dim border border-border-muted uppercase tracking-[0.2em] pointer-events-none select-none">
              {extension}
            </div>
          )}
        </div>
        {errorMessage && (
          <span className="text-xs font-semibold text-red-500 px-1 animate-in fade-in slide-in-from-top-1">
            {errorMessage}
          </span>
        )}
      </div>

      {(isFolder || isCreate) && (
        <div className="flex flex-col gap-4">
          <label className="text-sm font-bold text-text-muted px-1 uppercase tracking-wider">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-3.5 px-1">
            {Object.values(FOLDER_COLORS).map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-7 h-7 rounded-full transition-all duration-300 transform hover:scale-125 hover:rotate-6 cursor-pointer border-2 shadow-sm ${
                  selectedColor === color
                    ? "border-white scale-125 shadow-lg shadow-white/20 z-10"
                    : "border-transparent opacity-40 hover:opacity-100"
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3.5 pt-2">
        <button
          onClick={handleCancel}
          className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 bg-bg-hover text-text-muted hover:text-text-main hover:bg-bg-hover/80 cursor-pointer border border-transparent hover:border-border-muted shadow-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading || !folderName.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5"
        >
          {isLoading ? <Loader className="animate-spin" size={18} strokeWidth={2.5} /> : null}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default FolderModal;
