import { asyncHandler } from "../middlewares/error.middleware.js";
import { getIO } from "../config/socket.js";
import Notification from "../models/Notification.model.js";
import {
  decrementUnreadCount,
  resetUnreadCount,
  incrementUnreadCount,
  getSocketId,
  getUnreadCount,
} from "../config/redis.js";
import { DELIVERY_STATUS, NOTIFICATION_PRIORITIES } from "../constants/Notification.js";

export const notifyUser = async ({ recipientId, type, sender, document, priority }) => {
  try {
    const message = Notification.buildMessage(type, sender.name, document.name);
    const notification = await Notification.create({
      recipientId,
      type,
      senderId: sender.id,
      message,
      documentId: document.id,
      priority: priority || NOTIFICATION_PRIORITIES.MEDIUM,
    });
    const cleanNotification = {
      id: notification._id,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      createdAt: notification.createdAt,
    };

    await incrementUnreadCount(recipientId.toString());
    const userSocketId = await getSocketId(recipientId.toString());
    if (userSocketId) {
      getIO().to(userSocketId).emit("notification:new", cleanNotification);
      Notification.findByIdAndUpdate(notification._id, {
        deliveryStatus: DELIVERY_STATUS.SENT,
        deliveredAt: new Date(),
      }).exec();
    }
  } catch (error) {
    console.error("Error notifying user:", error);
  }
};

export const getNotifications = asyncHandler(async (req, res) => {
  try {
    let unreadCount;
    const userId = req.user.id;
    const { page, limit } = req.query;
    const notifications = await Notification.getNotifications(userId, page, limit);
    const hasMore = (await Notification.countDocuments({ recipientId: userId })) > page * limit;
    const response = {
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id,
        message: n.message,
        type: n.type,
        priority: n.priority,
        createdAt: n.createdAt,
        isRead: n.isRead,
      })),
      hasMore,
    };
    if (+page === 1) {
      const cached = await getUnreadCount(userId?.toString());
      if (cached) {
        unreadCount = cached;
      } else {
        unreadCount = await Notification.getUnreadCount(userId);
        await resetUnreadCount(userId?.toString(), unreadCount);
      }
      response.unreadCount = unreadCount;
    }

    res.status(200).json(response);
  } catch (_) {
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
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read" });
  }
});

export const markAllRead = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    await Notification.markAllRead(userId);
    await resetUnreadCount(userId?.toString());
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (_) {
    res.status(500).json({ success: false, message: "Failed to mark all notifications as read" });
  }
});
