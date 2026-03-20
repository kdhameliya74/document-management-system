export const NOTIFICATION_TYPES = {
  DOC_SHARED: "doc_shared",
  DOC_UPDATED: "doc_updated",
  DOC_DELETED: "doc_deleted",
  DOC_SHARED_REMOVED: "doc_shared_removed",

  // TODO: Add more notification types
  PERMISSION_CHANGED: "permission_changed",
  PERMISSION_REVOKED: "permission_revoked",
  COMMENT_ADDED: "comment_added",
  REMOVED_ACCESS: "removed_access",
};

export const DELIVERY_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  FAILED: "failed",
  DELIVERED: "delivered",
};

export const NOTIFICATION_MESSAGES_TEMPLATES = {
  [NOTIFICATION_TYPES.DOC_SHARED]: "{sender} shared a document with you: {document}",
  [NOTIFICATION_TYPES.DOC_UPDATED]: "{sender} updated a document: {document}",
  [NOTIFICATION_TYPES.PERMISSION_CHANGED]:
    "{sender} changed the permission of a document: {document}",
  [NOTIFICATION_TYPES.PERMISSION_REVOKED]:
    "{sender} revoked the permission of a document: {document}",
  [NOTIFICATION_TYPES.COMMENT_ADDED]: "{sender} added a comment to a document: {document}",
  [NOTIFICATION_TYPES.REMOVED_ACCESS]: "{sender} removed your access to a document: {document}",
  [NOTIFICATION_TYPES.DOC_DELETED]: "{sender} deleted a document: {document}",
  [NOTIFICATION_TYPES.DOC_SHARED_REMOVED]: "{sender} removed your access to a document: {document}",
};

export const NOTIFICATION_PRIORITIES = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};
