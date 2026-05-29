import axiosClient from "./axiosClient";

const foodApi = {
  getAll: (params = {}) => axiosClient.get("/foods", { params }),
  getById: (_id) => axiosClient.get(`/foods/${_id}`),
};

export default foodApi;
