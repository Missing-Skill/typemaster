import axios from "axios";

const API_URL = "http://localhost:5000/api";

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
      const response = await axios.post(`${API_URL}/results`, result);
      return response.data;
    } catch (error) {
      console.error("Error saving result:", error);
      throw error;
    }
  },

  getResults: async () => {
    try {
      const response = await axios.get(`${API_URL}/results`);
      return response.data;
    } catch (error) {
      console.error("Error fetching results:", error);
      throw error;
    }
  },
};
