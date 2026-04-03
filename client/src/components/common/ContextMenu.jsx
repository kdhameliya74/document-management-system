import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { clearUISelection } from "@/store/documents.slice";

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
        dispatch(clearUISelection())
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, dispatch]);

  return (
    <div
      className="fixed bg-bg-panel/90 rounded-2xl border border-border-main shadow-2xl z-[2000] min-w-[220px] animate-in fade-in zoom-in-95 duration-200 overflow-hidden glass-panel p-1.5"
      style={{ top: y, left: x }}
      ref={menuRef}
    >
      {items.map((item, index) => {
        const Icon = item?.icon || null;
        return (
          <button
            key={index}
            disabled={item.disabled}
            className="flex items-center w-full py-2.5 px-4 text-left text-sm text-text-main transition-all duration-200 hover:bg-white/5 rounded-xl cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={(e) => {
              item.onClick(e);
              onClose();
            }}
          >
            {Icon && (
              <span className="mr-3 flex items-center text-text-dim group-hover:text-primary transition-colors">
                {React.isValidElement(Icon) ? Icon : <Icon size={16} strokeWidth={2} />}
              </span>
            )}
            <span className="font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
