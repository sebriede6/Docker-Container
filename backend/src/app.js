import express from 'express';
import cors from 'cors';
import noteRoutes from './routes/noteRoutes.js'; // Importiere den Router
import { initializeNotes } from './controllers/noteController.js'; // Nur initializeNotes importieren
import { PORT as configPort } from './config/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Alle Notiz-Routen unter dem Präfix /api/notes einbinden
app.use('/api/notes', noteRoutes);

app.use((req, res, next) => {
  res.status(404).json({ message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.` });
});

app.use((err, req, res, next) => {
  console.error("Zentraler Fehlerhandler:", err.stack || err.message || err);
  res.status(500).json({ message: 'Interner Serverfehler.' });
});

const initializeApp = async () => {
  try {
    await initializeNotes(); // Direkt initializeNotes aufrufen
  } catch (error) {
    console.error("Fehler beim Initialisieren der App-Daten:", error);
    throw error;
  }
};

export default app;
export { initializeApp, configPort as PORT };