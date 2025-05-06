const express = require('express');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const app = express();

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

const ensureDataDirExists = async () => {
  try {
    await fs.promises.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`Datenverzeichnis ${DATA_DIR} nicht gefunden. Erstelle es...`);
      try {
        await fs.promises.mkdir(DATA_DIR, { recursive: true });
        console.log(`Datenverzeichnis ${DATA_DIR} erfolgreich erstellt.`);
      } catch (mkdirError) {
        console.error(`Fehler beim Erstellen des Datenverzeichnisses ${DATA_DIR}:`, mkdirError);
        throw mkdirError;
      }
    } else {
      console.error(`Unerwarteter Fehler beim Zugriff auf ${DATA_DIR}:`, error);
      throw error;
    }
  }
};

const loadNotesFromFile = async () => {
  await ensureDataDirExists();
  try {
    await fs.promises.access(DATA_FILE);
    const fileData = await fs.promises.readFile(DATA_FILE, 'utf-8');
    console.log(`Notizen erfolgreich aus ${DATA_FILE} geladen.`);
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`${DATA_FILE} nicht gefunden. Initialisiere mit leeren Notizen.`);
      return [];
    }
    console.error(`Fehler beim Laden der Notizen aus ${DATA_FILE}:`, error);
    return [];
  }
};

const saveNotesToFile = async (notesToSave) => {
  await ensureDataDirExists();
  try {
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(notesToSave, null, 2), 'utf-8');
    console.log(`Notizen erfolgreich in ${DATA_FILE} gespeichert.`);
  } catch (error) {
    console.error(`Fehler beim Speichern der Notizen in ${DATA_FILE}:`, error);
  }
};

let notes = [];
let nextId = 1;

app.get('/api/notes', (req, res) => {
  console.log('GET /api/notes aufgerufen');
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const note = notes.find(n => n.id === noteId);
  if (note) {
    console.log(`GET /api/notes/${noteId} gefunden`);
    res.json(note);
  } else {
    console.log(`GET /api/notes/${noteId} nicht gefunden`);
    res.status(404).json({ message: 'Notiz nicht gefunden' });
  }
});

app.post('/api/notes', async (req, res, next) => {
  try {
    if (!req.body || !req.body.text || typeof req.body.text !== 'string' || req.body.text.trim() === '') {
      console.log('POST /api/notes - Ungültige Anfrage (Text fehlt)');
      return res.status(400).json({ message: 'Text für Notiz fehlt oder ist ungültig' });
    }

    const newNote = {
      id: nextId++,
      text: req.body.text.trim()
    };
    notes.push(newNote);
    await saveNotesToFile(notes);
    console.log(`POST /api/notes - Neue Notiz erstellt:`, newNote);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
});

app.delete('/api/notes/:id', async (req, res, next) => {
  try {
    const noteId = parseInt(req.params.id, 10);
    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex > -1) {
      const deletedNote = notes.splice(noteIndex, 1);
      await saveNotesToFile(notes);
      console.log(`DELETE /api/notes/${noteId} - Notiz gelöscht:`, deletedNote[0]);
      res.status(200).json({ message: 'Notiz erfolgreich gelöscht', id: noteId });
    } else {
      console.log(`DELETE /api/notes/${noteId} nicht gefunden`);
      res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch (error) {
    next(error);
  }
});

app.use((req, res, next) => {
  res.status(404).json({ message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.` });
});

app.use((err, req, res, next) => {
  console.error("Unerwarteter Serverfehler:", err.stack || err.message || err);
  res.status(500).json({ message: 'Interner Serverfehler. Bitte versuchen Sie es später erneut.' });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    notes = await loadNotesFromFile();
    if (notes.length > 0) {
      nextId = Math.max(...notes.map(n => n.id)) + 1;
    } else {
      nextId = 1;
    }
    console.log("Globale 'notes' Variable initialisiert:", notes);
    console.log("Nächste ID initialisiert auf:", nextId);

    app.listen(PORT, () => {
      console.log(`Backend API läuft auf http://localhost:${PORT}`);
      console.log(`Daten werden in/aus ${DATA_FILE} gelesen/geschrieben.`);
    });
  } catch (error) {
    console.error("Fehler beim Starten des Servers oder Laden der initialen Daten:", error);
    process.exit(1);
  }
};

startServer();