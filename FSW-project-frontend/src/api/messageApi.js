import axiosClient from "./axiosClient";

const messageApi = {
  /** GET /conversations */
  getConversations: (params = {}) => axiosClient.get("/conversations", { params }),

  /** GET /messages — pass { conversationId } as params to filter */
  getMessages: (params = {}) => axiosClient.get("/messages", { params }),

  /** POST /messages — send a new message */
  sendMessage: (data) => axiosClient.post("/messages", data),
};

export default messageApi;
