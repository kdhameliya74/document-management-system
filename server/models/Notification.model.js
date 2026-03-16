import mongoose from "mongoose";

const NOTIFICATION_TYPES = {
    DOC_SHARED: "doc_shared",
    DOC_UPDATED: "doc_updated",
    PERMISSION_CHANGED: "permission_changed",
    PERMISSION_REVOKED: "permission_revoked",
    COMMENT_ADDED: "comment_added", // TODO: Add more notification types
    REMOVED_ACCESS: "removed_access",
};

const NOTIFICATION_MESSAGES_TEMPLATES = {
    [NOTIFICATION_TYPES.DOC_SHARED]: "{sender} shared a document with you: {document}",
    [NOTIFICATION_TYPES.DOC_UPDATED]: "{sender} updated a document: {document}",
    [NOTIFICATION_TYPES.PERMISSION_CHANGED]:
        "{sender} changed the permission of a document: {document}",
    [NOTIFICATION_TYPES.PERMISSION_REVOKED]:
        "{sender} revoked the permission of a document: {document}",
    [NOTIFICATION_TYPES.COMMENT_ADDED]: "{sender} added a comment to a document: {document}",
    [NOTIFICATION_TYPES.REMOVED_ACCESS]: "{sender} removed your access to a document: {document}",
};

const NOTIFICATION_PRIORITIES = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low",
};

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

notificationSchema.statics.markAllRead = function (recipientId) {
    return this.updateMany(
        { recipientId, isRead: false },
        { $set: { isRead: true, readAt: new Date() } }
    );
};

notificationSchema.statics.buildMessage = function (type, senderName, documentName) {
    const template = NOTIFICATION_MESSAGES_TEMPLATES[type];
    if (!template) throw new Error(`Unknown notification type: ${type}`);
    return template
        .replace("{sender}", senderName)
        .replace("{document}", documentName);
};

notificationSchema.statics.getUnreadCount = function (recipientId) {
    return this.countDocuments({ recipientId, isRead: false });
};

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
