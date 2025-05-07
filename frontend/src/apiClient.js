import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
console.log("API Base URL used by Frontend:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getNotes = () => apiClient.get("/notes");
export const addNote = (noteText) =>
  apiClient.post("/notes", { text: noteText });
export const deleteNote = (id) => apiClient.delete(`/notes/${id}`);

export default apiClient;
