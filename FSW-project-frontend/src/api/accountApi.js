import axiosClient from "./axiosClient";

const accountApi = {
  /** GET /accounts — all accounts */
  getAll: (params = {}) => axiosClient.get("/accounts", { params }),

  /** POST /accounts — create an account */
  create: (data) => axiosClient.post("/accounts", data),

  /** PUT /accounts/:_id */
  update: (_id, data) => axiosClient.put(`/accounts/${_id}`, data),

  /** DELETE /accounts/:_id */
  remove: (_id) => axiosClient.delete(`/accounts/${_id}`),
};

export default accountApi;
