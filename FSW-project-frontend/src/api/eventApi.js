import axiosClient from "./axiosClient";

const eventApi = {
  /** GET /events — returns unwrapped array via interceptor */
  getAll: (params = {}) => axiosClient.get("/events", { params }),

  /** GET /events/:_id — fetch-all + find (mock server pattern) */
  getById: async (_id) => {
    const all = await axiosClient.get("/events");
    const item = all.find((e) => e._id === _id);
    if (!item) throw new Error("Class/Event not found");
    return item;
  },

  /** POST /events — create a new class/event */
  create: (data) => axiosClient.post("/events", data),

  /** PUT /events/:_id */
  update: (_id, data) => axiosClient.put(`/events/${_id}`, data),

  /** DELETE /events/:_id */
  remove: (_id) => axiosClient.delete(`/events/${_id}`),
};

export default eventApi;
