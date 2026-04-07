import { asyncHandler } from "../../middlewares/error.middleware.js";
import ActivityLog from "../../models/ActivityLog.model.js";
import { ACTIVITY_ACTIONS } from "../../shared/Shared.js";

const createActivityLog = async (activity) => {
  try {
    await ActivityLog.create(activity);
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
};

export const logActivity = (req, doc, activity = {}) => {
  setImmediate(() => {
    const sender = req.user;
    const log = {
      user: sender.id,
      targetType: doc.docType,
      target: doc._id,
      targetName: doc.name,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      action: "",
      metadata: {},
      ...activity,
    };
    createActivityLog(log).catch((err) => {
      console.error("Unhandled Activity Log Error:", err);
    });
  });
};

export const getActivityLogs = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const query = { target: id };
  const [activities, total] = await Promise.all([
    ActivityLog.find(query)
      .select("-__v -ipAddress -userAgent -target")
      .populate("user", "firstName lastName email")
      .populate("metadata.moveFrom", "name")
      .populate("metadata.moveTo", "name")
      .populate("metadata.parentId", "name")
      .populate("metadata.sharedWith.user", "firstName lastName email")
      .populate("metadata.removedUserId", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  const hasMore = skip + limit < total;

  const transformed = activities.map((a) => {
    const details = {};
    const m = a.metadata || {};

    switch (a.action) {
      case ACTIVITY_ACTIONS.FILE_MOVE:
      case ACTIVITY_ACTIONS.FOLDER_MOVE:
        details.from = m.moveFrom?.name || "My Drive";
        details.to = m.moveTo?.name || "My Drive";
        break;
      case ACTIVITY_ACTIONS.FILE_UPDATE:
      case ACTIVITY_ACTIONS.FOLDER_UPDATE:
        if (m.oldName) details.oldName = m.oldName;
        if (m.newName) details.newName = m.newName;
        if (m.oldColor) details.oldColor = m.oldColor;
        if (m.newColor) details.newColor = m.newColor;
        break;
      case ACTIVITY_ACTIONS.FILE_RESTORE:
      case ACTIVITY_ACTIONS.FOLDER_RESTORE:
      case ACTIVITY_ACTIONS.FOLDER_CREATE:
        details.parentFolder = m.parentId?.name || "My Drive";
        break;
      case ACTIVITY_ACTIONS.FILE_SHARE:
      case ACTIVITY_ACTIONS.FOLDER_SHARE:
        details.sharedWith = (m.sharedWith || []).map((c) => ({
          name: c.user ? `${c.user.firstName} ${c.user.lastName}` : null,
          email: c.email,
          permission: c.permission,
        }));
        break;
      case ACTIVITY_ACTIONS.FILE_UNSHARE:
      case ACTIVITY_ACTIONS.FOLDER_UNSHARE:
        details.removedUser = {
          name: m.removedUserId ? `${m.removedUserId.firstName} ${m.removedUserId.lastName}` : null,
          email: m.unsharedWithEmail,
        };
        break;
    }

    return {
      id: a._id,
      action: a.action,
      targetType: a.targetType,
      targetName: a.targetName,
      performedBy: a.user,
      details,
      timestamp: a.createdAt,
    };
  });

  res.status(200).json({
    success: true,
    activities: transformed,
    total,
    hasMore,
  });
});
