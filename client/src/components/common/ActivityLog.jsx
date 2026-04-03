import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Activity } from "lucide-react";

export const ACTIVITY_THEMES = {
  file_upload: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  file_download: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  file_update: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  file_delete: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  file_permanent_delete: {
    color: "text-rose-600",
    bg: "bg-rose-600/10",
    border: "border-rose-600/20",
  },
  file_restore: {
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  file_share: { color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  file_unshare: {
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  file_rename: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  file_move: { color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  folder_create: { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  folder_delete: { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  folder_permanent_delete: {
    color: "text-rose-600",
    bg: "bg-rose-600/10",
    border: "border-rose-600/20",
  },
  folder_restore: {
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
  folder_update: { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  folder_move: { color: "text-sky-500", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  folder_share: {
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  folder_unshare: {
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  comment_add: { color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  comment_edit: { color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  comment_delete: { color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  version_create: { color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  version_restore: {
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
  },
};

export const ACTIVITY_MESSAGES = {
  file_upload: (a) => `Uploaded file "${a.targetName}"`,
  file_download: (a) => `Downloaded file "${a.targetName}"`,
  file_update: (a) => `Updated file "${a.targetName}"`,
  file_delete: (a) => `Deleted file "${a.targetName}"`,
  file_permanent_delete: (a) => `Permanently deleted file "${a.targetName}"`,
  file_restore: (a) => `Restored file "${a.targetName}"`,
  file_share: (a) => `Shared file "${a.targetName}"`,
  file_unshare: (a) => `Unshared file "${a.targetName}"`,
  file_rename: (a) => `Renamed file from "${a.metadata?.oldName}" to "${a.metadata?.newName}"`,
  file_move: (a) => `Moved file "${a.targetName}"`,

  folder_create: (a) => `Created folder "${a.targetName}"`,
  folder_delete: (a) => `Deleted folder "${a.targetName}"`,
  folder_permanent_delete: (a) => `Permanently deleted folder "${a.targetName}"`,
  folder_restore: (a) => `Restored folder "${a.targetName}"`,
  folder_update: (a) => `Updated folder "${a.targetName}"`,
  folder_move: (a) => `Moved folder "${a.targetName}"`,
  folder_share: (a) => `Shared folder "${a.targetName}"`,
  folder_unshare: (a) => `Unshared folder "${a.targetName}"`,
  comment_add: () => `Added a comment`,
  comment_edit: () => `Edited a comment`,
  comment_delete: () => `Deleted a comment`,

  version_create: () => `Created a new version`,
  version_restore: () => `Restored a previous version`,
};

export const activityLogs = [
  {
    _id: "1",
    user: { id: "u1", name: "Aman" },
    action: "folder_create",
    target: "f1",
    targetName: "Project Docs",
    metadata: {},
    createdAt: "2026-04-03T10:00:00Z",
  },
  {
    _id: "2",
    user: { id: "u2", name: "Riya" },
    action: "file_upload",
    target: "file1",
    targetName: "Report.pdf",
    metadata: {},
    createdAt: "2026-04-03T10:05:00Z",
  },
  {
    _id: "3",
    user: { id: "u1", name: "Aman" },
    action: "file_rename",
    target: "file1",
    targetName: "Final Report.pdf",
    metadata: {
      oldName: "Report.pdf",
      newName: "Final Report.pdf",
    },
    createdAt: "2026-04-03T10:10:00Z",
  },
  {
    _id: "4",
    user: { id: "u3", name: "John" },
    action: "file_download",
    target: "file1",
    targetName: "Final Report.pdf",
    metadata: {},
    createdAt: "2026-04-03T10:15:00Z",
  },
  {
    _id: "5",
    user: { id: "u2", name: "Riya" },
    action: "file_move",
    target: "file1",
    targetName: "Final Report.pdf",
    metadata: {
      from: "Project Docs",
      to: "Archives",
    },
    createdAt: "2026-04-03T10:20:00Z",
  },
  {
    _id: "6",
    user: { id: "u1", name: "Aman" },
    action: "folder_share",
    target: "f1",
    targetName: "Project Docs",
    metadata: {},
    createdAt: "2026-04-03T10:25:00Z",
  },
];

const ActivityLog = () => {
  return (
    <div className="w-full flex flex-col mt-4">
      {/* Header */}
      <div className="text-[10px] font-black uppercase tracking-[0.15em] text-text-dim mb-4 px-4 flex items-center gap-2">
        <Activity size={12} className="text-primary/70" />
        Recent Activity
      </div>

      {/* Activity List */}
      <div className="space-y-0 px-4">
        {activityLogs.length === 0 && (
          <p className="text-xs text-text-muted italic py-2">No activity yet</p>
        )}

        {activityLogs.map((activity, idx) => {
          const theme = ACTIVITY_THEMES[activity.action] || {
            color: "text-text-muted",
            bg: "bg-bg-hover",
            border: "border-border-muted",
          };
          const getMessage = ACTIVITY_MESSAGES[activity.action] || (() => activity.action);

          return (
            <div
              key={activity._id}
              className="group flex gap-4 items-start relative pb-6 last:pb-0"
            >
              {/* Vertical line connecting icons */}
              {idx !== activityLogs.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-gradient-to-b from-border-muted/30 to-transparent z-0" />
              )}

              {/* Colorful Container with Initial */}
              <div className="relative">
                <div
                  className={`w-8 h-8 rounded-xl ${theme.bg} border ${theme.border} flex items-center justify-center ${theme.color} relative z-10 transition-all group-hover:scale-110 shadow-sm shadow-black/5 text-[10px] font-black uppercase tracking-tighter`}
                >
                  {activity.user?.name?.[0] || "U"}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 mt-0.5">
                <p className="text-xs text-text-main leading-relaxed">
                  <span className="font-black text-text-main opacity-90">
                    {activity.user?.name || "User"}
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

      {/* Tighter Load More Button */}
      {activityLogs.length > 0 && (
        <div className="mt-4 px-4 pb-8 flex justify-center">
          <button
            className="px-4 py-1.5 rounded-full bg-bg-hover border border-border-muted/50 text-[9px] font-black uppercase tracking-[0.1em] text-text-dim hover:text-text-main hover:bg-bg-panel hover:border-text-dim/20 transition-all flex items-center justify-center gap-1.5 group active:scale-[0.95]"
            onClick={() => {}} // No functionality as requested
          >
            <span>More</span>
            <ChevronDown size={10} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
