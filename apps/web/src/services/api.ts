import axios from "axios";

// Define interface for standard API responses
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// Use environment variable if available, otherwise default to localhost for local development
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add X-User-ID header
api.interceptors.request.use(
  (config) => {
    // Get user_id from localStorage
    const userId =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;

    if (userId) {
      config.headers = config.headers || {};
      config.headers["X-User-ID"] = userId;
    } else {
      console.warn(
        "No user_id found in localStorage for request authorization"
      );
    }

    // log
    console.log("➡️ [Request]", {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and data extraction
api.interceptors.response.use(
  (response) => {
    console.log("✅ [Response]", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    // Handle standard API response format
    const apiResponse = response.data as ApiResponse<any>;

    // Check if code is not 200
    if (apiResponse.code !== 200) {
      return Promise.reject({
        message: apiResponse.message,
        code: apiResponse.code,
        response: response,
      });
    }

    // Return only the data field for success responses
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Server responded with an error status code
      const status = error.response.status;
      const data = error.response.data;

      if (status === 401) {
        console.error("Unauthorized: User ID is missing or invalid");
        // You could redirect to login page or prompt user to set user_id
      } else {
        console.error(`API Error (${status}):`, data);
      }

      // Check if the error response has the standard format
      if (
        data &&
        typeof data === "object" &&
        "code" in data &&
        "message" in data
      ) {
        return Promise.reject({
          message: data.message,
          code: data.code,
          response: error.response,
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("Network Error:", error.message);
    } else {
      // Error in setting up the request
      console.error("Request Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Extend axios with TypeScript to make our API methods return the unwrapped data directly
const get = async <T>(url: string, config?: any): Promise<T> => {
  const response = await api.get(url, config);
  return response as T;
};

const post = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await api.post(url, data, config);
  return response as T;
};

const put = async <T>(url: string, data?: any, config?: any): Promise<T> => {
  const response = await api.put(url, data, config);
  return response as T;
};

const del = async <T>(url: string, config?: any): Promise<T> => {
  const response = await api.delete(url, config);
  return response as T;
};

// Export our wrapped methods
export const apiClient = {
  get,
  post,
  put,
  delete: del,
};

// Helper to check if API is reachable
export const checkApiConnection = async (): Promise<boolean> => {
  try {
    await api.get("/health");
    return true;
  } catch (error) {
    console.error("API connection failed:", error);
    return false;
  }
};
