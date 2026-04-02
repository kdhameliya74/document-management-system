import ActivityLog from "../models/ActivityLog.model.js";

const createActivityLog = async (activity) => {
    const activityLog = await ActivityLog.create(activity);
    return activityLog;
};

export { createActivityLog };
