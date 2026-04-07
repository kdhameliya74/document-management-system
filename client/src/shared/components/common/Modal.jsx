import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({ isOpen, onClose, title, icon: Icon, children }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-[2px] flex items-center justify-center z-[1000] p-4"
        onClick={onClose}
      >
        <motion.div
          className="bg-bg-panel border border-border-main rounded-[2rem] w-full max-w-[500px] shadow-2xl overflow-hidden glass-panel"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border-muted">
            <div className="flex items-center gap-4">
              {Icon && (
                <div className="w-12 h-12 rounded-2xl bg-bg-hover flex items-center justify-center text-primary shadow-inner">
                  {React.cloneElement(Icon, { size: 24, strokeWidth: 1.5 })}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-text-main tracking-tight leading-none mb-1">
                  {title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted p-2.5 rounded-xl transition-all hover:bg-bg-hover hover:text-text-main cursor-pointer"
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>

          <div className="p-5">{children}</div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
