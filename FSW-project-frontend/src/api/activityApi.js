import axiosClient from "./axiosClient";

const activityApi = {
  getAll: (params = {}) => axiosClient.get("/activities", { params }),
};

export default activityApi;
