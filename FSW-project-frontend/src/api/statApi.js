import axiosClient from "./axiosClient";

const statApi = {
  /**
   * GET /stats
   * FIX 3: The mock server stores stats as an array with a single object.
   * After the interceptor unwraps the envelope, we extract [0] here.
   */
  getStats: async () => {
    const data = await axiosClient.get("/stats");
    return Array.isArray(data) ? data[0] : data;
  },
};

export default statApi;
