import React, { useState } from "react";
import Modal from "@/components/common/Modal";
import { Loader, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const DeleteModal = ({ isOpen, onClose, onDelete, note, item, title = "Move to Trash" }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const data = await onDelete();
      if (data?.success) {
        toast.success(data.message);
      }
    } catch (err) {
      toast.error(err || "Item is not deleted!");
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Trash2 className="text-red-500" />}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-text-main">
            Are you sure you want to move{" "}
            {item?.name && <span className="font-medium text-red-500">{item?.name} </span>} to
            trash?
          </p>

          {note && (
            <div className="mt-4">
              <p className="text-xs text-text-muted leading-relaxed">
                <span className="font-semibold text-text-main">Note:</span> {note}
              </p>
            </div>
          )}
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
            className="py-2.5 px-5 flex gap-2 cursor-pointer rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-500/70 disabled:opacity-70"
          >
            {isLoading ? <Loader className="animate-spin" size={18} /> : null}
            <span>Move to trash</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;
