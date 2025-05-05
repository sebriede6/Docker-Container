// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
app.use(express.json());


let notes = [
  { id: 1, text: 'Erste Notiz vom Backend' },
  { id: 2, text: 'React Frontend erweitern' }
];
let nextId = 3;


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


app.post('/api/notes', (req, res) => {
  if (!req.body || !req.body.text || typeof req.body.text !== 'string' || req.body.text.trim() === '') {
    console.log('POST /api/notes - Ungültige Anfrage (Text fehlt)');
    return res.status(400).json({ message: 'Text für Notiz fehlt oder ist ungültig' });
  }

  const newNote = {
    id: nextId++,
    text: req.body.text.trim()
  };
  notes.push(newNote);
  console.log(`POST /api/notes - Neue Notiz erstellt:`, newNote);
  res.status(201).json(newNote);
});


app.delete('/api/notes/:id', (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const noteIndex = notes.findIndex(n => n.id === noteId);

  if (noteIndex > -1) {
    const deletedNote = notes.splice(noteIndex, 1);
    console.log(`DELETE /api/notes/${noteId} - Notiz gelöscht:`, deletedNote[0]);
    res.status(200).json({ message: 'Notiz erfolgreich gelöscht', id: noteId });
  } else {
    console.log(`DELETE /api/notes/${noteId} nicht gefunden`);
    res.status(404).json({ message: 'Notiz nicht gefunden' });
  }
});


app.use((req, res, next) => {
  res.status(404).json({ message: `Endpunkt ${req.method} ${req.originalUrl} nicht gefunden.` });
});


app.use((err, req, res, next) => {
  console.error("Unerwarteter Serverfehler:", err.stack);
  res.status(500).json({ message: 'Interner Serverfehler' });
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend API läuft auf http://localhost:${PORT}`);
});