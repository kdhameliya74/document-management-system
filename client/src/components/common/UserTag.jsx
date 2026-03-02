import React, { memo } from "react";
import { User, X } from "lucide-react";

/**
 * Reusable UserTag component for displaying users/collaborators with optional close action.
 * 
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Optional icon to display (defaults to User icon)
 * @param {string} props.label - Main text (e.g., email or name)
 * @param {string} [props.subLabel] - Secondary text (e.g., permission level)
 * @param {Function} [props.onClose] - Callback for when the close icon is clicked. If not provided, close button is hidden.
 * @param {string} [props.className] - Additional CSS classes for the container
 */
const UserTag = memo(({ 
  icon = <User size={12} />, 
  label, 
  subLabel, 
  onClose, 
  className = "" 
}) => {
  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 rounded-full border transition-all duration-200 bg-bg-panel border-border-main text-text-main hover:border-border-muted hover:bg-bg-hover ${className}`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center bg-bg-hover text-text-muted`}
      >
        {icon}
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-xs truncate max-w-[150px]">{label}</span>
        {subLabel && (
          <span className="text-[9px] font-semibold uppercase font-black tracking-tight opacity-50">
            {subLabel}
          </span>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="p-0.5 rounded-full hover:bg-white/10 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
          aria-label={`Remove ${label}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
});

UserTag.displayName = "UserTag";

export default UserTag;
