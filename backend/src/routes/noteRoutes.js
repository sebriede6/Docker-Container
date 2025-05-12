import express from 'express';

import {
    getAllNotes,
    getNoteById,
    createNote,
    updateNoteById,
    deleteNoteById
 } from '../controllers/noteController.js';

const router = express.Router();

router.get('/', getAllNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNoteById);
router.delete('/:id', deleteNoteById);

export default router;