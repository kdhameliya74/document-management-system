import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Activity } from "lucide-react";

import { useGetActivityLogsQuery } from "@/store/api/activity.api";

export const ACTIVITY_MESSAGES = {
  file_upload: (a) => `Uploaded file "${a.targetName}"`,
  file_download: (a) => `Downloaded file "${a.targetName}"`,
  file_update: (a) => `Renamed file from "${a.metadata.oldName}" to "${a.metadata.newName}"`,
  file_delete: (a) => `Deleted file "${a.targetName}"`,
  file_permanent_delete: (a) => `Permanently deleted file "${a.targetName}"`,
  file_restore: (a) => `Restored file "${a.targetName}"`,
  file_share: (a) => `Shared file "${a.targetName}"`,
  file_unshare: (a) => `Unshared file "${a.targetName}"`,
  file_move: (a) => `Moved file "${a.targetName}"`,

  folder_create: (a) => `Created folder "${a.targetName}"`,
  folder_delete: (a) => `Deleted folder "${a.targetName}"`,
  folder_permanent_delete: (a) => `Permanently deleted folder "${a.targetName}"`,
  folder_restore: (a) => `Restored folder "${a.targetName}"`,
  folder_update: (a) => {
    const parts = [];
    if (a.metadata?.newName) {
      parts.push(`Renamed folder from "${a.metadata.oldName}" to "${a.metadata.newName}"`);
    }
    if (a.metadata?.newColor) {
      parts.push(`Changed color of folder from "${a.metadata.oldColor}" to "${a.metadata.newColor}"`);
    }
    return parts.join(" and ");
  },
  folder_move: (a) => `Moved folder "${a.targetName}"`,
  folder_share: (a) => `Shared folder "${a.targetName}"`,
  folder_unshare: (a) => `Unshared folder "${a.targetName}"`,
  comment_add: () => `Added a comment`,
  comment_edit: () => `Edited a comment`,
  comment_delete: () => `Deleted a comment`,

  version_create: () => `Created a new version`,
  version_restore: () => `Restored a previous version`,
};

const ActivityLog = ({ docId }) => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, error } = useGetActivityLogsQuery({ docId, page });

  const activityLogs = data?.activities || [];
  const hasMore = data?.hasMore || false;

  useEffect(() => {
    if (data?.fetchedPages?.length > 0) {
      const maxPage = Math.max(...data.fetchedPages);
      if (maxPage > page) {
        setPage(maxPage);
      }
    }
  }, [data?.fetchedPages]);

  if (isLoading && page === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-50">
        <Activity size={24} className="animate-pulse text-primary/50 mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Loading Activity...</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col mt-4">
      {/* Header */}
      <div className="text-sm font-black uppercase text-white/50 mb-4 px-4 flex items-center gap-2">
        <Activity size={16} className="text-primary/70" />
        Recent Activity
      </div>

      <div className={`space-y-4 px-2 transition-opacity duration-300 ${isFetching ? "opacity-50" : "opacity-100"}`}>
        {activityLogs.length === 0 && !isLoading && (
          <p className="text-sm text-white/50 italic py-2 text-center">No activity yet</p>
        )}

        {activityLogs.map((activity) => {
          const getMessage = ACTIVITY_MESSAGES[activity.action] || (() => activity.action);

          return (
            <div
              key={activity.id}
              className="group flex flex-col gap-1 relative border-l-2 border-border-muted pl-4 py-0.5"
            >
              <div className="flex-1">
                <p className="text-xs text-text-main leading-relaxed">
                  <span className="font-black text-text-main opacity-90">
                    {activity.user?.firstName} {activity.user?.lastName}
                  </span>{" "}
                  <span className="text-text-muted font-medium">{getMessage(activity)}</span>
                </p>

                <p className="text-[9px] font-black text-text-dim uppercase tracking-tighter mt-1 opacity-60">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-4 px-4 pb-8 flex justify-center">
          <button
            className="px-4 py-1.5 rounded-full bg-bg-hover border border-border-muted/50 text-[9px] font-black uppercase tracking-[0.1em] text-text-dim hover:text-text-main hover:bg-bg-panel hover:border-text-dim/20 transition-all flex items-center justify-center gap-1.5 group active:scale-[0.95] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isFetching}
          >
            <span>{isFetching ? "Loading..." : "More"}</span>
            {!isFetching && <ChevronDown size={10} className="group-hover:translate-y-0.5 transition-transform" />}
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
