import mongoose from "mongoose";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";
import {
  NOTIFICATION_TYPES,
  DELIVERY_STATUS,
  NOTIFICATION_MESSAGES_TEMPLATES,
  NOTIFICATION_PRIORITIES,
} from "../constants/Notification.js";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: Object.values(NOTIFICATION_PRIORITIES),
      default: NOTIFICATION_PRIORITIES.MEDIUM,
    },
    deliveryStatus: {
      type: String,
      enum: Object.values(DELIVERY_STATUS),
      default: DELIVERY_STATUS.PENDING,
    },
    deliveredAt: { type: Date },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true, versionKey: false, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

notificationSchema.index({ recipientId: 1, type: 1, createdAt: -1 });

notificationSchema.index({ recipientId: 1, createdAt: -1 });

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

notificationSchema.methods.markRead = function () {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.statics.getUnread = function (userId, limit = 10) {
  return this.find({
    recipientId: userId,
    isRead: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

notificationSchema.statics.getNotifications = function (userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  return this.find({ recipientId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
};

notificationSchema.statics.markAllRead = function (recipientId) {
  return this.updateMany(
    { recipientId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } },
  );
};

notificationSchema.statics.buildMessage = function (type, senderName, documentName) {
  const template = NOTIFICATION_MESSAGES_TEMPLATES[type];
  if (!template) throw new Error(`Unknown notification type: ${type}`);
  return template.replace("{sender}", senderName).replace("{document}", documentName);
};

notificationSchema.statics.getUnreadCount = function (recipientId) {
  return this.countDocuments({ recipientId, isRead: false });
};

notificationSchema.plugin(mongooseLeanVirtuals);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
