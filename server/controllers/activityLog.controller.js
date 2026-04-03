import { asyncHandler } from "../middlewares/error.middleware.js";
import ActivityLog from "../models/ActivityLog.model.js";

const createActivityLog = async (activity) => {
    try { await ActivityLog.create(activity); }
    catch (error) { console.error("Activity Log Error:", error); }
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
            ...activity
        };
        createActivityLog(log).catch(err => {
            console.error("Unhandled Activity Log Error:", err);
        });
    });
};

export const getActivityLogs = asyncHandler(async (req, res) => {
    const { docId } = req.params;
    const activityLogs = await ActivityLog.find({ target: docId })
        .sort({ createdAt: -1 })
        .lean();
    console.log(activityLogs);
    res.status(200).json({ success: true, activityLogs });
});

