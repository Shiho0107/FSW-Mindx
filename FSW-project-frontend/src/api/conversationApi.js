import axiosClient from "./axiosClient";

const conversationApi = {
  /** GET /conversations — get conversations for current user */
  getAll: (params = {}) => axiosClient.get("/conversations", { params }),

  /** GET /conversations/:id */
  getById: (id) => axiosClient.get(`/conversations/${id}`),

  /** POST /conversations/direct — get or create 1-on-1 direct conversation */
  getOrCreateDirect: (currentUserId, targetUserId) =>
    axiosClient.post("/conversations/direct", { currentUserId, targetUserId }),

  /** POST /conversations — create group conversation */
  createGroup: (data) => axiosClient.post("/conversations", { ...data, isGroup: true }),

  /** POST /conversations/:id/read — mark as read */
  markAsRead: (id, userId) => axiosClient.post(`/conversations/${id}/read`, { userId }),
};

export default conversationApi;
