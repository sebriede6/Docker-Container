import * as noteDbService from '../services/noteDbService.js';
import { logger } from '../utils/logger.js';

const getAllNotes = async (req, res, next) => {
  logger.debug('Controller: getAllNotes aufgerufen');
  try {
    const notes = await noteDbService.getAllNotes();
    res.status(200).json(notes);
  } catch (error) {
    logger.error('Controller: Fehler in getAllNotes', { error: error.message });
    next(error);
  }
};

const getNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  if (isNaN(noteId)) {
    logger.warn('Controller: Ungültige ID in getNoteById angefordert', { paramId: req.params.id });
    return res.status(400).json({ message: 'Ungültige Notiz-ID angegeben.' });
  }
  logger.debug(`Controller: getNoteById aufgerufen für ID: ${noteId}`);
  try {
    const note = await noteDbService.getNoteById(noteId);
    if (note) {
      res.status(200).json(note);
    } else {
      logger.warn(`Controller: Notiz nicht gefunden für ID: ${noteId}`);
      res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch (error) {
    logger.error(`Controller: Fehler in getNoteById für ID: ${noteId}`, { error: error.message });
    next(error);
  }
};

const createNote = async (req, res, next) => {
  logger.debug('Controller: createNote aufgerufen mit Body:', req.body);
  const { text } = req.body;

  if (typeof text !== 'string' || text.trim() === '') {
    logger.warn('Controller: Ungültiger Text in createNote - Text fehlt oder ist leer', { body: req.body });
    return res.status(400).json({ message: 'Text für Notiz fehlt oder ist ungültig.' });
  }
  if (text.length > 1000) { // Beispiel: Maximale Länge
    logger.warn('Controller: Ungültiger Text in createNote - Text zu lang', { textLength: text.length });
    return res.status(400).json({ message: 'Text für Notiz darf maximal 1000 Zeichen lang sein.' });
  }

  try {
    const newNote = await noteDbService.createNote(text.trim());
    res.status(201).json(newNote);
  } catch (error) {
    logger.error('Controller: Fehler in createNote', { error: error.message });
    next(error);
  }
};

const updateNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  const { text } = req.body;

  if (isNaN(noteId)) {
    logger.warn('Controller: Ungültige ID in updateNoteById angefordert', { paramId: req.params.id });
    return res.status(400).json({ message: 'Ungültige Notiz-ID angegeben.' });
  }
  if (typeof text !== 'string' || text.trim() === '') {
    logger.warn('Controller: Ungültiger Text in updateNoteById - Text fehlt oder ist leer', { body: req.body, id: noteId });
    return res.status(400).json({ message: 'Neuer Text für Notiz fehlt oder ist ungültig.' });
  }
  if (text.length > 1000) { // Beispiel: Maximale Länge
    logger.warn('Controller: Ungültiger Text in updateNoteById - Text zu lang', { id: noteId, textLength: text.length });
    return res.status(400).json({ message: 'Text für Notiz darf maximal 1000 Zeichen lang sein.' });
  }

  logger.debug(`Controller: updateNoteById aufgerufen für ID: ${noteId} mit Body:`, req.body);
  try {
    const updatedNote = await noteDbService.updateNoteById(noteId, text.trim());
    if (updatedNote) {
      res.status(200).json(updatedNote);
    } else {
      logger.warn(`Controller: Notiz nicht gefunden für Update ID: ${noteId}`);
      res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch (error) {
    logger.error(`Controller: Fehler in updateNoteById für ID: ${noteId}`, { error: error.message });
    next(error);
  }
};

const deleteNoteById = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);

  if (isNaN(noteId)) {
    logger.warn('Controller: Ungültige ID in deleteNoteById angefordert', { paramId: req.params.id });
    return res.status(400).json({ message: 'Ungültige Notiz-ID angegeben.' });
  }

  logger.debug(`Controller: deleteNoteById aufgerufen für ID: ${noteId}`);
  try {
    const deleted = await noteDbService.deleteNoteById(noteId);
    if (deleted) {
      res.status(200).json({ message: 'Notiz erfolgreich gelöscht', id: noteId });
    } else {
      logger.warn(`Controller: Notiz nicht gefunden für Lösch-ID: ${noteId}`);
      res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch (error) {
    logger.error(`Controller: Fehler in deleteNoteById für ID: ${noteId}`, { error: error.message });
    next(error);
  }
};

const toggleNoteCompleted = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);

  if (isNaN(noteId)) {
    logger.warn('Controller: Ungültige ID in toggleNoteCompleted angefordert', { paramId: req.params.id });
    return res.status(400).json({ message: 'Ungültige Notiz-ID angegeben.' });
  }

  logger.debug(`Controller: toggleNoteCompleted aufgerufen für ID: ${noteId}`);
  try {
    const updatedNote = await noteDbService.toggleNoteCompletedById(noteId);
    if (updatedNote) {
      res.status(200).json(updatedNote);
    } else {
      logger.warn(`Controller: Notiz nicht gefunden für Toggle ID: ${noteId}`);
      res.status(404).json({ message: 'Notiz nicht gefunden' });
    }
  } catch (error) {
    logger.error(`Controller: Fehler in toggleNoteCompleted für ID: ${noteId}`, { error: error.message });
    next(error);
  }
};

export {
  getAllNotes,
  getNoteById,
  createNote,
  updateNoteById,
  deleteNoteById,
  toggleNoteCompleted
};