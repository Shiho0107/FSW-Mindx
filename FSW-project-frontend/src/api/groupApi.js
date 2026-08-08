import axiosClient from "./axiosClient";

const groupApi = {
  /** GET /groups */
  getAll: (params = {}) => axiosClient.get("/groups", { params }),

  /** GET /groups/:id */
  getById: (id) => axiosClient.get(`/groups/${id}`),

  /** POST /groups */
  create: (data) => axiosClient.post("/groups", data),

  /** PUT /groups/:id */
  update: (id, data) => axiosClient.put(`/groups/${id}`, data),

  /** DELETE /groups/:id */
  remove: (id) => axiosClient.delete(`/groups/${id}`),
};

export default groupApi;
