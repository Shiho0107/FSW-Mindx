import axiosClient from "./axiosClient";

const studentApi = {
  /** GET /students — returns unwrapped array via interceptor */
  getAll: (params = {}) => axiosClient.get("/students", { params }),

  /** GET /students/:_id */
  getById: async (_id) => {
    const allData = await axiosClient.get('/students');
    const singleItem = allData.find(item => item._id === _id);
    if (!singleItem) throw new Error("Not found");
    return singleItem;
  },

  /** POST /students — body contains the new student object */
  create: (data) => axiosClient.post("/students", data),

  /** PUT /students/:_id — FIX 1: use _id in URL */
  update: (_id, data) => axiosClient.put(`/students/${_id}`, data),

  /** DELETE /students/:_id — FIX 1: use _id in URL */
  remove: (_id) => axiosClient.delete(`/students/${_id}`),
};

export default studentApi;
