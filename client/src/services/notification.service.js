import api from "@/utils/api";

const NotificationService = {
    async bootstrapForUser() {
        return api.get("/notifications/bootstrap");
    },
    async getNotifications(page, limit) {
        return api.get("/notifications", { params: { page, limit } });
    },
    async markOneRead(id) {
        return api.patch(`/notifications/${id}/read`);
    },
    async markAllRead() {
        return api.patch("/notifications/read-all");
    },
    async deleteNotification(id) { // TODO: implement
        return api.delete(`/notifications/${id}`);
    },
};

export default NotificationService;