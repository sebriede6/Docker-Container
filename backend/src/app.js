import express from 'express';
import cors from 'cors';
import * as noteController from './controllers/noteController.js';
import { PORT as configPort } from './config/index.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/notes', noteController.getAllNotes);
app.post('/api/notes', noteController.createNote);
app.get('/api/notes/:id', noteController.getNoteById);
app.put('/api/notes/:id', noteController.updateNoteById);
app.delete('/api/notes/:id', noteController.deleteNoteById);

app.use((req, res, next) => {
  res.status(404).json({ message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.` });
});

app.use((err, req, res, next) => {
  console.error("Zentraler Fehlerhandler:", err.stack || err.message || err);
  res.status(500).json({ message: 'Interner Serverfehler.' });
});

const initializeApp = async () => {
  try {
    await noteController.initializeNotes();
  } catch (error) {
    console.error("Fehler beim Initialisieren der App-Daten:", error);
    throw error;
  }
};

export default app;
export { initializeApp, configPort as PORT };