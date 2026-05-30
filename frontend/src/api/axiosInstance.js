import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.PROD ? "https://buildmart-api-oy5t.onrender.com/api" : "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = () => {
  refreshSubscribers.forEach((cb) => cb());
  refreshSubscribers = [];
};

// Response interceptor: handle token refresh and 401 errors
API.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Suppress 401 errors for initial auth check (getMe, refresh on app load)
    if (err.response?.status === 401) {
      const isAuthCheckRequest =
        originalRequest.url?.includes("/auth/me") ||
        originalRequest.url?.includes("/auth/refresh");

      if (isAuthCheckRequest && !originalRequest._retry) {
        // Silently handle auth check failures - just reject without logging
        return Promise.reject(err);
      }
    }

    if (err.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;
        originalRequest._retry = true;

        try {
          // Try to refresh the access token
          await API.post("/auth/refresh");
          onTokenRefreshed();
          return API(originalRequest);
        } catch (refreshErr) {
          // Refresh failed, clear auth and redirect to login
          isRefreshing = false;
          refreshSubscribers = [];
          window.location.href = "/login";
          return Promise.reject(refreshErr);
        }
      }

      // If already refreshing, queue the request
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => {
          resolve(API(originalRequest));
        });
      });
    }

    return Promise.reject(err);
  }
);

export default API;
