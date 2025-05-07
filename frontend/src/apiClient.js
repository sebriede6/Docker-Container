// frontend/src/apiClient.js
import axios from 'axios'; // Stelle sicher, dass axios importiert ist

// Die VITE_API_URL-Logik kann hier komplett entfernt werden, da sie
// im Browser-Kontext für diese Art von Setup nicht mehr benötigt wird.
// Der Browser soll immer relative Anfragen an den eigenen Host stellen,
// die dann von Nginx weitergeleitet werden.

const API_BASE_URL = '/api'; // Das ist die entscheidende Änderung

console.log("FE: API Base URL wird jetzt verwendet:", API_BASE_URL); // Angepasster Log

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNotes = () => {
  console.log("getNotes wird aufgerufen mit baseURL:", apiClient.defaults.baseURL);
  return apiClient.get('/notes'); // Ergibt /api/notes
};
export const addNote = (noteText) => {
  console.log("addNote wird aufgerufen mit baseURL:", apiClient.defaults.baseURL);
  return apiClient.post('/notes', { text: noteText }); // Ergibt /api/notes
};
export const deleteNote = (id) => {
  console.log("deleteNote wird aufgerufen mit baseURL:", apiClient.defaults.baseURL);
  return apiClient.delete(`/notes/${id}`); // Ergibt /api/notes/:id
};

export default apiClient;