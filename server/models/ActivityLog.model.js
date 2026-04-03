import mongoose from "mongoose";
import { DOC_TYPES, ACTIVITY_ACTIONS } from "../constants/Shared.js";

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
      enum: Object.values(ACTIVITY_ACTIONS),
    },
    targetType: {
      type: String,
      required: true,
      enum: [DOC_TYPES.FILE, DOC_TYPES.FOLDER, "Comment"],
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

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
