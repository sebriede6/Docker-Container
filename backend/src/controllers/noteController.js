import * as fileService from '../services/fileService.js';

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
  console.log('Controller: getAllNotes aufgerufen für Healthcheck oder Frontend');
  res.status(200).json(notes);
};

const getNoteById = (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  console.log(`Controller: getNoteById aufgerufen für ID: ${noteId}`);
  const note = notes.find(n => n.id === noteId);
  if (note) {
    res.status(200).json(note);
  } else {
    res.status(404).json({ message: 'Notiz nicht gefunden' });
  }
};

const createNote = async (req, res, next) => {
  console.log('Controller: createNote aufgerufen mit Body:', req.body);
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

const updateNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  console.log(`Controller: updateNoteById aufgerufen für ID: ${noteId} mit Body:`, req.body);
  try {
    if (!req.body || !req.body.text || typeof req.body.text !== 'string' || req.body.text.trim() === '') {
       return res.status(400).json({ message: 'Neuer Text für Notiz fehlt oder ist ungültig' });
    }
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex > -1) {
       notes[noteIndex].text = req.body.text.trim();
       await fileService.saveNotes(notes);
       res.status(200).json(notes[noteIndex]);
    } else {
       res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch(error) {
      next(error);
  }
};

const deleteNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  console.log(`Controller: deleteNoteById aufgerufen für ID: ${noteId}`);
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

export {
  initializeNotes,
  getAllNotes,
  getNoteById,
  createNote,
  updateNoteById,
  deleteNoteById,
};