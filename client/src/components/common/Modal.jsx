import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
        <motion.div 
          className="bg-bg-panel border border-border-muted rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between p-5 border-b border-border-muted bg-bg-panel">
            <h3 className="text-lg font-bold text-text-main">{title}</h3>
            <button onClick={onClose} className="text-text-muted p-1.5 rounded-lg transition-all hover:bg-bg-hover hover:text-text-main cursor-pointer">
              <X size={20} />
            </button>
          </div>
          <div className="p-6 bg-bg-panel">
            {children}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default Modal;
