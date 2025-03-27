import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log("Making request to:", config.url);
    console.log("Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log("Response received:", response.data);
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Request timeout");
      return Promise.reject(new Error("Request timeout. Please try again."));
    }
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new Error("Network error. Please check your connection and try again.")
      );
    }
    console.error("Response error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

export interface ResultData {
  name: string;
  usn: string;
  results: {
    wpm: number;
    cpm: number;
    accuracy: number;
    error: number;
    totalTime: number;
    totalCharacters: number;
  };
}

export const api = {
  saveResult: async (result: ResultData) => {
    try {
      console.log("Saving result:", result);
      const response = await apiClient.post("/results", result);
      console.log("Save result response:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
      throw error;
    }
  },

  getResults: async () => {
    try {
      console.log("Fetching results...");
      const response = await apiClient.get("/results");
      console.log("Get results response:", response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error("API Error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage,
        });
        throw new Error(errorMessage);
      }
      throw error;
    }
  },
};
