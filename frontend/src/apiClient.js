import axios from 'axios'; 



const API_BASE_URL = '/api'; 

console.log("FE: API Base URL wird jetzt verwendet:", API_BASE_URL); 

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNotes = () => {
  console.log("getNotes wird aufgerufen mit baseURL:", apiClient.defaults.baseURL);
  return apiClient.get('/notes'); 
};
export const addNote = (noteText) => {
  console.log("addNote wird aufgerufen mit baseURL:", apiClient.defaults.baseURL);
  return apiClient.post('/notes', { text: noteText }); 
};
export const deleteNote = (id) => {
  console.log("deleteNote wird aufgerufen mit baseURL:", apiClient.defaults.baseURL);
  return apiClient.delete(`/notes/${id}`); 
};

export default apiClient;