import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { renameItem } from "@/store/documentSystemSlice";
import Modal from "@/components/common/Modal";

const RenameModal = ({ isOpen, onClose, item, itemType }) => {
  const [newName, setNewName] = useState(() => item?.name ?? "sss");
  const dispatch = useDispatch();

  const handleRename = () => {
    if (newName.trim() && item) {
      dispatch(
        renameItem({
          id: item.id,
          type: itemType,
          newName: newName,
        }),
      );
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRename();
    }
  };

  const handleClose = () => {
    setNewName("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Rename Item">
      <div className="flex flex-col gap-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full p-4 border border-border-muted rounded-xl bg-bg-main text-text-main text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={handleClose}
            className="py-2.5 px-5 rounded-xl font-normal text-sm transition-all bg-bg-hover text-text-muted hover:text-text-main cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleRename}
            disabled={!newName.trim()}
            className="py-2.5 px-5 rounded-xl font-medium text-sm transition-all bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RenameModal;
