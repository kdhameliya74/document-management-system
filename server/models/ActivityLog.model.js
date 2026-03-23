import mongoose from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "file_upload",
        "file_download",
        "file_update",
        "file_delete",
        "file_restore",
        "file_share",
        "file_unshare",
        "file_rename",
        "file_move",
        "folder_create",
        "folder_delete",
        "folder_restore",
        "folder_rename",
        "folder_move",
        "folder_share",
        "folder_unshare",
        "comment_add",
        "comment_edit",
        "comment_delete",
        "version_create",
        "version_restore",
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ["File", "Folder", "Comment", "FileVersion"],
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetName: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ target: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

// TTL index - automatically delete logs older than 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

activityLogSchema.plugin(mongooseLeanVirtuals);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
