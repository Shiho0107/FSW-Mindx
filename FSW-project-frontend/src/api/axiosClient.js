import axios from "axios";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const API_KEY  = import.meta.env.VITE_API_KEY;
const BASE_URL = import.meta.env.VITE_BASE_URL;

// ─── INSTANCE ─────────────────────────────────────────────────────────────────
const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Add authentication headers if needed
axiosClient.interceptors.request.use(
  (config) => {
    // Optional: Add API key header if provided
    if (API_KEY) {
      config.headers.Authorization = `Bearer ${API_KEY}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// Backend returns plain data directly (no envelope wrapping)
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
