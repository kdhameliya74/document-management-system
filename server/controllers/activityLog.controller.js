import ActivityLog from "../models/ActivityLog.model.js";

const createActivityLog = async (activity) => {
    try { await ActivityLog.create(activity); }
    catch (error) { console.error("Activity Log Error:", error); }
};

export const logActivity = (activity) => {
    console.log("Activity Log:", activity);
    setImmediate(() => {
        createActivityLog(activity).catch(err => {
            console.error("Unhandled Activity Log Error:", err);
        });
    });
};

export { createActivityLog };
