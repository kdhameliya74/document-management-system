import { asyncHandler } from "../middlewares/error.middleware.js";
import ActivityLog from "../models/ActivityLog.model.js";

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
    ActivityLog.find(query).select("-__v -ipAddress -userAgent -target")
      .populate("user", "firstName lastName -_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ActivityLog.countDocuments(query),
  ]);

  const hasMore = skip + limit < total;

  res.status(200).json({
    success: true,
    activities: activities.map((activity) => ({
      ...activity,
      id: activity._id ? activity._id.toString() : null,
      _id: undefined,
    })),
    total,
    hasMore,
  });
});
