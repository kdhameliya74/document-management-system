import { asyncHandler } from "../middlewares/error.middleware.js";
import Notification from "../models/Notification.model.js";
import { decrementUnreadCount } from "../config/redis.js";

export const getNotifications = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const { page, limit } = req.query;
        const notifications = await Notification.getNotifications(userId, page, limit);
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch notifications" });
    }
});

export const markOneRead = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }
        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();
        await decrementUnreadCount(req.user.id);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark notification as read" });
    }
});

export const markAllRead = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.markAllRead(userId);
        await resetUnreadCount(userId?.toString());
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
    }
});

export const bootstrapForUser = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const [notifications, unreadCount] = await Promise.all([
            Notification.getUnread(userId),
            Notification.getUnreadCount(userId),
        ]);
        await resetUnreadCount(userId?.toString(), unreadCount);
        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to bootstrap for user" });
    }
});
