import React, { useState, useTransition } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Folder, Loader } from "lucide-react";
import { FOLDER_COLORS, ERROR_MESSAGES } from "@/helpers/constants.js";

import { createFolder } from "@/store/fileSystemSlice";
import toast from "react-hot-toast";
import Modal from "@/components/common/Modal";

const CreateFolderModal = ({ isOpen, onClose, currentFolderId }) => {
  const [folderName, setFolderName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS.DEFAULT);
  const { folders } = useSelector((state) => state.fileSystem);
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const handleCreate = () => {
    const sanitizedName = folderName.trim();
    if (sanitizedName) {
      const currentFolder = folders[currentFolderId];
      const isDuplicate = currentFolder?.childFolderIds?.some(
        (folderId) =>
          folders[folderId]?.name.toLowerCase() === sanitizedName.toLowerCase(),
      );

      if (isDuplicate) {
        setErrorMessage(ERROR_MESSAGES.FOLDER_NAME_DUPLICATE);
      } else {
        startTransition(async () => {
          try {
            await dispatch(
              createFolder({
                name: sanitizedName,
                parent: currentFolderId === "root" ? null : currentFolderId,
                color: selectedColor,
                owner: user?.id || user?._id,
              }),
            ).unwrap();
            
            toast.success("Folder created successfully!");
            handleCancel();
          } catch (err) {
            toast.error(err || "Failed to create folder");
          }
        });
      }
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
      handleCreate();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Folder"
      icon={Folder}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <label htmlFor="folder_name" className="text-sm text-text-muted px-1">
            Name
          </label>
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
            }`}
          />
          {errorMessage && (
            <span className="text-sm text-red-500 px-1">{errorMessage}</span>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-text-muted px-1">
            Choose folder Color
          </label>
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

        <div className="flex justify-end gap-4 mt-2">
          <button
            onClick={handleCancel}
            className="py-2.5 px-5 rounded-xl font-normal text-sm transition-all bg-bg-hover text-text-muted hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isPending || !folderName.trim()}
            className="flex gap-2 py-2.5 px-5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPending ? <Loader className="animate-spin" size={18} /> : null}
            <span>Create</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateFolderModal;
