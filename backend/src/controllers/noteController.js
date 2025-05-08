const fileService = require('../services/fileService');

let notes = [];
let nextId = 1;

const initializeNotes = async () => {
  try {
    notes = await fileService.loadNotes();
    if (notes.length > 0) {
      nextId = Math.max(...notes.map(n => n.id)) + 1;
    } else {
      nextId = 1;
    }
  } catch (error) {
    console.error("Controller: Error initializing notes:", error);
    notes = [];
    nextId = 1;
  }
};

const getAllNotes = (req, res) => {
  console.log('Controller: getAllNotes aufgerufen'); // Log hinzugefügt zur Sicherheit
  res.json(notes);
};

const getNoteById = (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  console.log(`Controller: getNoteById aufgerufen für ID: ${noteId}`); // Log hinzugefügt
  const note = notes.find(n => n.id === noteId);
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ message: 'Notiz nicht gefunden' });
  }
};

const createNote = async (req, res, next) => {
  console.log('Controller: createNote aufgerufen mit Body:', req.body); // Log hinzugefügt
  try {
    if (!req.body || !req.body.text || typeof req.body.text !== 'string' || req.body.text.trim() === '') {
      return res.status(400).json({ message: 'Text für Notiz fehlt oder ist ungültig' });
    }
    const newNote = {
      id: nextId++,
      text: req.body.text.trim()
    };
    notes.push(newNote);
    await fileService.saveNotes(notes);
    res.status(201).json(newNote);
  } catch (error) {
    next(error);
  }
};

// --- TEST-VERSION der Update-Funktion ---
const updateNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  // Dieser Log ist jetzt entscheidend:
  console.log(`>>> TEST: updateNoteById aufgerufen für ID: ${noteId} mit Body:`, req.body);
  try {
    // Füge hier ggf. noch die Validierung ein, falls du sie testen willst
    if (!req.body || !req.body.text || typeof req.body.text !== 'string' || req.body.text.trim() === '') {
       console.log(">>> TEST: Update fehlgeschlagen - Body ungültig");
       return res.status(400).json({ message: 'Neuer Text für Notiz fehlt oder ist ungültig' });
    }
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex > -1) {
       console.log(">>> TEST: Notiz gefunden, sende Test-Antwort.");
       // Sende nur eine Test-Antwort zurück, ohne zu speichern
       res.status(200).json({ id: noteId, text: req.body.text, message: "Update-Endpunkt erreicht (Test)" });
    } else {
       console.log(">>> TEST: Notiz nicht gefunden (404).");
       res.status(404).json({ message: 'Notiz nicht gefunden (Test)' });
    }
  } catch(error) {
      console.error(">>> TEST: Unerwarteter Fehler im Update-Handler:", error);
      next(error);
  }
};
// --- Ende TEST-VERSION ---

const deleteNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  console.log(`Controller: deleteNoteById aufgerufen für ID: ${noteId}`); // Log hinzugefügt
  try {
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex > -1) {
      notes.splice(noteIndex, 1);
      await fileService.saveNotes(notes);
      res.status(200).json({ message: 'Notiz erfolgreich gelöscht', id: noteId });
    } else {
      res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initializeNotes,
  getAllNotes,
  getNoteById,
  createNote,
  updateNoteById, // Die Testversion wird exportiert
  deleteNoteById,
};