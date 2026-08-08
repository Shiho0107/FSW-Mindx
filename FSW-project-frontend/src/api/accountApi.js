import axiosClient from "./axiosClient";

const accountApi = {
  /** GET /accounts — all accounts */
  getAll: (params = {}) => axiosClient.get("/accounts", { params }),

  /** GET /accounts/scoped — role-scoped accounts directory */
  getScoped: (params = {}) => axiosClient.get("/accounts/scoped", { params }),

  /** POST /accounts — create an account */
  create: (data) => axiosClient.post("/accounts", data),

  /** PUT /accounts/:_id */
  update: (_id, data) => axiosClient.put(`/accounts/${_id}`, data),

  /** DELETE /accounts/:_id */
  remove: (_id) => axiosClient.delete(`/accounts/${_id}`),
};

export default accountApi;
