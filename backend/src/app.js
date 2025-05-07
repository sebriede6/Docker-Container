// backend/src/app.js

const express = require('express');
const cors = require('cors');
const noteRoutes = require('./routes/noteRoutes'); // Bleibt gleich
const { initializeNotes } = require('./controllers/noteController'); // Bleibt gleich
const { PORT } = require('./config'); // Bleibt gleich

const app = express();

app.use(cors());
app.use(express.json());

// KORREKTUR HIER:
// Der noteRoutes-Router, der Routen wie '/notes' definiert,
// wird unter dem Präfix '/api' eingehängt.
// ALT: app.use('/api/notes', noteRoutes);
app.use('/api', noteRoutes); // NEU

// Dieser Teil für 404 und Fehlerbehandlung bleibt gleich
app.use((req, res, next) => {
  res.status(404).json({ message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.` });
});

app.use((err, req, res, next) => {
  console.error("Zentraler Fehlerhandler:", err.stack || err.message || err);
  res.status(500).json({ message: 'Interner Serverfehler.' });
});

const initializeApp = async () => { // Bleibt gleich
  try {
    await initializeNotes();
  } catch (error) {
    console.error("Fehler beim Initialisieren der App-Daten:", error);
    throw error;
  }
};

module.exports = { app, initializeApp, PORT }; // Bleibt gleich