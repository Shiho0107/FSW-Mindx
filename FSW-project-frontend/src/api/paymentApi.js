import axiosClient from "./axiosClient";

const paymentApi = {
  getAll:        (params = {})   => axiosClient.get("/payments", { params }),
  getByStudent:  (studentId)     => axiosClient.get("/payments", { params: { studentId } }),
  getById:       (_id)           => axiosClient.get(`/payments/${_id}`),
  create:        (data)          => axiosClient.post("/payments", data),
  update:        (_id, data)     => axiosClient.put(`/payments/${_id}`, data),
  remove:        (_id)           => axiosClient.delete(`/payments/${_id}`),
};

export default paymentApi;
