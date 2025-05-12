import pool from '../db/index.js';
import { logger } from '../utils/logger.js';

const getAllNotes = async () => {
  const sql = 'SELECT id, text_content AS text, completed, created_at, updated_at FROM notes ORDER BY created_at DESC';
  try {
    const result = await pool.query(sql);
    logger.debug('Service: getAllNotes successful', { count: result.rowCount });
    return result.rows;
  } catch (err) {
    logger.error('Service: Error in getAllNotes', { error: err.message, stack: err.stack, sql });
    throw new Error('Database query failed while fetching notes.');
  }
};

const getNoteById = async (id) => {
  const sql = 'SELECT id, text_content AS text, completed, created_at, updated_at FROM notes WHERE id = $1';
  const values = [id];
  try {
    const result = await pool.query(sql, values);
    logger.debug('Service: getNoteById successful', { id, found: result.rowCount > 0 });
    return result.rows[0];
  } catch (err) {
    logger.error('Service: Error in getNoteById', { error: err.message, stack: err.stack, sql, id });
    throw new Error(`Database query failed while fetching note with id ${id}.`);
  }
};

const createNote = async (text) => {
  const sql = 'INSERT INTO notes (text_content) VALUES ($1) RETURNING id, text_content AS text, completed, created_at, updated_at';
  const values = [text];
  try {
    const result = await pool.query(sql, values);
    logger.info('Service: createNote successful', { id: result.rows[0]?.id });
    return result.rows[0];
  } catch (err) {
    logger.error('Service: Error in createNote', { error: err.message, stack: err.stack, sql, text });
    throw new Error('Database query failed while creating note.');
  }
};

const updateNoteById = async (id, text) => {
  const sql = 'UPDATE notes SET text_content = $1 WHERE id = $2 RETURNING id, text_content AS text, completed, created_at, updated_at';
  const values = [text, id];
  try {
    const result = await pool.query(sql, values);
    logger.info('Service: updateNoteById successful', { id, updated: result.rowCount > 0 });
    if (result.rowCount === 0) {
         return null;
    }
    return result.rows[0];
  } catch (err) {
    logger.error('Service: Error in updateNoteById', { error: err.message, stack: err.stack, sql, id, text });
    throw new Error(`Database query failed while updating note with id ${id}.`);
  }
};

const deleteNoteById = async (id) => {
  const sql = 'DELETE FROM notes WHERE id = $1 RETURNING id';
  const values = [id];
  try {
    const result = await pool.query(sql, values);
    logger.info('Service: deleteNoteById successful', { id, deleted: result.rowCount > 0 });
    return result.rowCount > 0;
  } catch (err) {
    logger.error('Service: Error in deleteNoteById', { error: err.message, stack: err.stack, sql, id });
    throw new Error(`Database query failed while deleting note with id ${id}.`);
  }
};

const toggleNoteCompletedById = async (id) => {
    const sql = 'UPDATE notes SET completed = NOT completed WHERE id = $1 RETURNING id, text_content AS text, completed, created_at, updated_at';
    const values = [id];
    try {
        const result = await pool.query(sql, values);
        logger.info('Service: toggleNoteCompletedById successful', { id, updated: result.rowCount > 0 });
        if (result.rowCount === 0) {
            return null;
        }
        return result.rows[0];
    } catch (err) {
        logger.error('Service: Error in toggleNoteCompletedById', { error: err.message, stack: err.stack, sql, id });
        throw new Error(`Database query failed while toggling completion status for note with id ${id}.`);
    }
};

export {
  getAllNotes,
  getNoteById,
  createNote,
  updateNoteById,
  deleteNoteById,
  toggleNoteCompletedById // Neue Funktion exportieren
};