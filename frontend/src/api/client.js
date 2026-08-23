import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

// Attach Authorization Bearer token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("thalassa_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or invalid, we can optionally dispatch an event or clean up
      const isAuthRoute = error.config && error.config.url && error.config.url.includes("/auth/");
      if (!isAuthRoute && localStorage.getItem("thalassa_token")) {
        console.warn("Session expired or unauthorized request. Clearing stored credentials.");
        localStorage.removeItem("thalassa_token");
        localStorage.removeItem("thalassa_user");
        window.dispatchEvent(new CustomEvent("thalassa_unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);
