import axiosClient from "./axiosClient";

const teacherApi = {
  getAll:  (params = {}) => axiosClient.get("/teachers", { params }),
  getById: async (_id) => {
    const allData = await axiosClient.get('/teachers');
    const singleItem = allData.find(item => item._id === _id);
    if (!singleItem) throw new Error("Not found");
    return singleItem;
  },
  create:  (data)        => axiosClient.post("/teachers", data),
  update:  (_id, data)   => axiosClient.put(`/teachers/${_id}`, data),
  remove:  (_id)         => axiosClient.delete(`/teachers/${_id}`),
};

export default teacherApi;
