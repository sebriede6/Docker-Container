// backend/src/app.js
const express = require('express');
const cors = require('cors');
// Importiere den Controller direkt
const noteController = require('./controllers/noteController');
// Importiere initializeNotes separat für den Start
const { initializeNotes } = require('./controllers/noteController');
const { PORT } = require('./config');

const app = express();

// Globale Middleware
app.use(cors());
app.use(express.json());

// --- Routen direkt hier definieren ---
// Stelle sicher, dass ALLE HTTP-Methoden hier korrekt aufgeführt sind
app.get('/api/notes', noteController.getAllNotes);
app.post('/api/notes', noteController.createNote);
app.get('/api/notes/:id', noteController.getNoteById);
app.put('/api/notes/:id', noteController.updateNoteById); // Prüfe diese Zeile genau
app.delete('/api/notes/:id', noteController.deleteNoteById);
// --- Ende direkte Routendefinition ---

// 404 Handler für nicht gefundene Routen
app.use((req, res, next) => {
  // Schicke 404 nur, wenn keine vorherige Route gematcht hat
  res.status(404).json({ message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.` });
});

// Allgemeiner Fehlerhandler
app.use((err, req, res, next) => {
  console.error("Zentraler Fehlerhandler:", err.stack || err.message || err);
  res.status(500).json({ message: 'Interner Serverfehler.' });
});

// Funktion zum Initialisieren der Anwendung (Daten laden)
const initializeApp = async () => {
  try {
    await initializeNotes();
  } catch (error) {
    console.error("Fehler beim Initialisieren der App-Daten:", error);
    throw error;
  }
};

module.exports = { app, initializeApp, PORT };