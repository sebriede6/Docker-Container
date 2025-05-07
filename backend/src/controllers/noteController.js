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
  res.json(notes);
};

const getNoteById = (req, res) => {
  const noteId = parseInt(req.params.id, 10);
  const note = notes.find(n => n.id === noteId);
  if (note) {
    res.json(note);
  } else {
    res.status(404).json({ message: 'Notiz nicht gefunden' });
  }
};

const createNote = async (req, res, next) => {
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

const deleteNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
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
  deleteNoteById,
};