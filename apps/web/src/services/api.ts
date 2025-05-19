import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add interceptors for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors here
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);
