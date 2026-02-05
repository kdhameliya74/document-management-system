import React, { useState } from "react";
import Modal from "@/components/common/Modal";
import { Loader, Trash } from "lucide-react";

const DeleteModal = ({ isOpen, onClose, onDelete, item, title = "Delete Item" }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await onDelete();
      onClose();
    } catch (err) {
      console.log(err);
      // error handling stays in parent or toast inside onDelete
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Trash className="text-red-500" />}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-text-main">
            Are you sure you want to delete{" "}
            {item?.name && <span className="font-medium text-red-500">{item?.name} </span>}?
          </p>
          <p className="text-text-muted">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="py-2.5 px-5 cursor-pointer rounded-xl text-sm bg-bg-hover text-text-muted hover:text-text-main disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="py-2.5 px-5 cursor-pointer rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-500/70 disabled:opacity-70"
          >
            {isLoading ? <Loader className="animate-spin" size={18} /> : null}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
