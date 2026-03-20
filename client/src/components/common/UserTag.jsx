import React, { memo } from "react";
import { User, X } from "lucide-react";

/**
 * Reusable UserTag component for displaying users/collaborators with optional close action.
 *
 * @param {Object} props
 * @param {React.ReactNode} [props.icon] - Optional icon to display (defaults to User icon)
 * @param {Object} props.collaborator - Collaborator object
 * @param {Function} [props.onRemove] - Callback for when the close icon is clicked. If not provided, close button is hidden.
 * @param {string} [props.className] - Additional CSS classes for the container
 */
const UserTag = memo(({ icon = <User size={12} />, collaborator, onRemove, className = "" }) => {
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
        <span className="text-xs truncate max-w-[150px]">{collaborator.email}</span>
        {collaborator.permission && (
          <span className="text-[9px] font-semibold uppercase font-black tracking-tight opacity-50">
            {collaborator.permission}
          </span>
        )}
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(collaborator);
          }}
          className="p-0.5 rounded-full hover:bg-white/10 text-text-muted hover:text-red-400 transition-colors cursor-pointer"
          aria-label={`Remove ${collaborator.email}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
});

UserTag.displayName = "UserTag";

export default UserTag;
