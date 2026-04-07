import React, { useState, useMemo, useCallback, memo } from "react";
import { useSelector } from "react-redux";
import { useGetActivityLogsQuery } from "@/features/activity/api/activity.api";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Activity } from "lucide-react";

export const ACTIVITY_MESSAGES = {
  file_upload: (a) => `Uploaded file "${a.targetName}"`,
  file_download: (a) => `Downloaded file "${a.targetName}"`,
  file_update: (a) =>
    a.details?.newName
      ? `Renamed file from "${a.details.oldName}" to "${a.details.newName}"`
      : `Updated file "${a.targetName}"`,
  file_delete: (a) => `Deleted file "${a.targetName}"`,
  file_permanent_delete: (a) => `Permanently deleted file "${a.targetName}"`,
  file_restore: (a) =>
    `Restored file "${a.targetName}" into "${a.details?.parentFolder || "My Drive"}"`,
  file_share: (a, user) => {
    const list = a.details?.sharedWith
      ?.map((c) => (c.email === user.email ? "You" : c.name || c.email))
      .join(", ");
    return `Shared file "${a.targetName}" with ${list || "someone"}`;
  },
  file_unshare: (a) =>
    `Unshared file "${a.targetName}" from ${a.details?.removedUser?.email || "someone"}`,
  file_move: (a) =>
    `Moved file "${a.targetName}" from "${a.details?.from || "My Drive"}" to "${a.details?.to || "My Drive"}"`,

  folder_create: (a) =>
    `Created folder "${a.targetName}" in "${a.details?.parentFolder || "My Drive"}"`,
  folder_delete: (a) => `Deleted folder "${a.targetName}"`,
  folder_permanent_delete: (a) => `Permanently deleted folder "${a.targetName}"`,
  folder_restore: (a) =>
    `Restored folder "${a.targetName}" into "${a.details?.parentFolder || "My Drive"}"`,
  folder_update: (a) => {
    const parts = [];
    if (a.details?.newName)
      parts.push(`Renamed folder from "${a.details.oldName}" to "${a.details.newName}"`);
    if (a.details?.newColor)
      parts.push(`Changed color from "${a.details.oldColor}" to "${a.details.newColor}"`);
    return parts.length > 0 ? parts.join(" and ") : `Updated folder "${a.targetName}"`;
  },
  folder_move: (a) =>
    `Moved folder "${a.targetName}" from "${a.details?.from || "My Drive"}" to "${a.details?.to || "My Drive"}"`,
  folder_share: (a, user) => {
    const list = a.details?.sharedWith
      ?.map((c) => (c.email === user.email ? "You" : c.name || c.email))
      .join(", ");
    return `Shared folder "${a.targetName}" with ${list || "someone"}`;
  },
  folder_unshare: (a) =>
    `Removed access from folder "${a.targetName}" for ${a.details?.removedUser?.email || "someone"}`,

  comment_add: (a) => `Added a comment on "${a.targetName}"`,
  comment_edit: (a) => `Edited a comment on "${a.targetName}"`,
  comment_delete: (a) => `Deleted a comment on "${a.targetName}"`,

  version_create: (a) => `Created a new version of "${a.targetName}"`,
  version_restore: (a) => `Restored a previous version of "${a.targetName}"`,
};

// Extracted + memoized — only re-renders when this specific activity or user changes
const ActivityItem = memo(({ activity, user }) => {
  const getMessage = ACTIVITY_MESSAGES[activity.action] ?? (() => activity.action);
  const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
  const { firstName, lastName, email } = activity.performedBy;
  const performedBy = email === user.email ? "You" : firstName + " " + lastName;

  return (
    <div className="group flex flex-col gap-1 relative border-l-2 border-border-muted pl-4 py-0.5">
      <p className="text-xs text-text-main leading-relaxed">
        <span className="font-black text-text-main opacity-90">{performedBy}</span>{" "}
        <span className="text-text-muted font-medium">{getMessage(activity, user)}</span>
      </p>
      <p className="text-[9px] font-black text-text-dim uppercase tracking-tighter mt-1 opacity-60">
        {timeAgo}
      </p>
    </div>
  );
});

ActivityItem.displayName = "ActivityItem"; // for debugging

const ActivityLog = ({ docId }) => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, error } = useGetActivityLogsQuery({ docId, page });
  const { user } = useSelector((state) => state.auth);

  // Derived values — avoids recomputing on every render
  const activityLogs = useMemo(() => data?.activities ?? [], [data?.activities]);
  const hasMore = data?.hasMore ?? false;

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-50">
        <Activity size={24} className="animate-pulse text-primary/50 mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">
          Loading Activity...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mt-4">
      <div className="text-sm font-black uppercase text-white/50 mb-4 px-4 flex items-center gap-2">
        <Activity size={16} className="text-primary/70" />
        Recent Activity
      </div>

      <div
        className={`space-y-4 px-2 transition-opacity duration-300 ${isFetching ? "opacity-50" : "opacity-100"}`}
      >
        {!isLoading && activityLogs.length === 0 && (
          <p className="text-sm text-white/50 italic py-2 text-center">No activity yet</p>
        )}

        {activityLogs.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} user={user} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 px-4 pb-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="px-4 py-1.5 rounded-full bg-bg-hover border border-border-muted/50 text-[9px] font-black uppercase tracking-[0.1em] text-text-dim hover:text-text-main hover:bg-bg-panel hover:border-text-dim/20 transition-all flex items-center justify-center gap-1.5 group active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isFetching ? "Loading..." : "More"}</span>
            {!isFetching && (
              <ChevronDown size={10} className="group-hover:translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="px-4 py-2 text-[10px] text-error/70 font-bold uppercase text-center italic">
          Failed to load activities
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
