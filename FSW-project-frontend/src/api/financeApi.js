import axiosClient from "./axiosClient";

const financeApi = {
  getExpenses: (params = {}) => axiosClient.get("/expenses", { params }), // Assuming an endpoint for expenses
  // Other finance related endpoints could go here if needed.
};

export default financeApi;
