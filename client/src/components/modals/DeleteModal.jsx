import React, { useState } from "react";
import Modal from "@/components/common/Modal";
import { Loader, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const Header = ({ children }) => children;
const Body = ({ children }) => children;
const Footer = ({ children }) => children;

const DeleteModal = ({
  isOpen,
  onSuccess,
  onFailed,
  onClose,
  onDelete,
  note,
  item,
  title = "Move to Trash",
  deleteText = "Move to Trash",
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Extract slots from children
  let headerSlot = null;
  let bodySlot = null;
  let footerSlot = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Header) headerSlot = child;
    else if (child.type === Body) bodySlot = child;
    else if (child.type === Footer) footerSlot = child;
  });

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      const data = await onDelete();
      if (data?.success) {
        toast.success(data.message);
      }
      onSuccess?.(data);
    } catch (err) {
      onFailed?.(err);
      toast.error(err);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={headerSlot || title}
      icon={<Trash2 className="text-red-400" />}
    >
      <div className="flex flex-col gap-8">
        {bodySlot ? (
          bodySlot
        ) : (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6">
            <p className="text-text-main text-base font-medium leading-relaxed">
              Are you sure you want to move{" "}
              {item?.name && <span className="font-black text-red-400">"{item?.name}"</span>} to
              trash?
            </p>

            {note && (
              <div className="mt-4 flex gap-3 p-4 bg-bg-panel/50 rounded-xl border border-border-muted/50">
                <div className="text-primary shrink-0">
                  <AlertCircle size={18} />
                </div>
                <p className="text-xs text-text-muted leading-relaxed font-medium">
                  <span className="font-bold text-text-main uppercase tracking-wider mr-1">
                    Note:
                  </span>{" "}
                  {note}
                </p>
              </div>
            )}
          </div>
        )}

        {footerSlot ? (
          footerSlot
        ) : (
          <div className="flex justify-end gap-3.5 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all duration-200 bg-bg-hover text-text-muted hover:text-text-main hover:bg-bg-hover/80 cursor-pointer border border-transparent hover:border-border-muted shadow-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl font-bold text-sm transition-all duration-300 bg-red-500 text-white hover:bg-red-400 shadow-xl shadow-red-500/20 disabled:opacity-40 cursor-pointer hover:-translate-y-0.5"
            >
              {isLoading ? (
                <Loader className="animate-spin" size={18} strokeWidth={2.5} />
              ) : (
                <Trash2 size={18} strokeWidth={2.5} />
              )}
              <span>{deleteText}</span>
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};

DeleteModal.Header = Header;
DeleteModal.Body = Body;
DeleteModal.Footer = Footer;

export default DeleteModal;
