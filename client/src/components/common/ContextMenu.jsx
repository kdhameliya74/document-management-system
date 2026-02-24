import React, { useEffect, useRef } from "react";
import { TriangleAlert } from "lucide-react";

const SEVERITY_COLORS = {
  warning: "text-yellow-500",
  error: "text-red-500",
  info: "text-grey-500",
};

const ContextMenu = ({ x, y, items, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className="fixed bg-white rounded-lg border border-slate-100 shadow-lg z-1000 min-w-[180px] animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
      style={{ top: y, left: x }}
      ref={menuRef}
    >
      {items.map((item, index) => {
        const Icon = item?.icon || null;
        return (
          <button
            key={index}
            className="flex items-center w-full py-2 px-3 text-left text-sm text-slate-900 transition-colors hover:bg-bg-hover hover:text-white cursor-pointer"
            onClick={() => {
              item.onClick();
              onClose();
            }}
          >
            {Icon && (
              <span className="mr-3 flex items-center">
                <Icon size={16} />
              </span>
            )}
            {item.label}
            {item.severity && (
              <span className={`${SEVERITY_COLORS[item.severity]}`} title={item?.tooltip || ""}>
                <TriangleAlert size={16} className="ml-2" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;
