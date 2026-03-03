import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { renameItem } from "@/store/documents.slice";
import { FileText } from "lucide-react";
import Modal from "@/components/common/Modal";

const RenameModal = ({ isOpen, onClose, item, itemType }) => {
  const [newName, setNewName] = useState(() => item?.name ?? "");
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

  <Modal isOpen={isOpen} onClose={handleClose} title="Rename Item" icon={<FileText />}>
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim px-1">
          New Name
        </label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Enter new name..."
          className="w-full p-5 border border-border-main rounded-2xl bg-bg-panel text-text-main text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 shadow-inner"
        />
      </div>

      <div className="flex justify-end gap-3.5">
        <button
          onClick={handleClose}
          className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 bg-bg-hover text-text-muted hover:text-text-main cursor-pointer border border-transparent hover:border-border-muted"
        >
          Cancel
        </button>
        <button
          onClick={handleRename}
          disabled={!newName.trim() || newName === item?.name}
          className="flex-[1.5] py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-300 bg-primary text-white hover:bg-primary-hover shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          Save Changes
        </button>
      </div>
    </div>
  </Modal>;
};

export default RenameModal;
