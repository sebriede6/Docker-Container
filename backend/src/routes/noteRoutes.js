import express from 'express';
import {
    getAllNotes,
    getNoteById,
    createNote,
    updateNoteById,
    deleteNoteById,
    toggleNoteCompleted 
 } from '../controllers/noteController.js';

const router = express.Router();

router.get('/', getAllNotes);
router.post('/', createNote);
router.get('/:id', getNoteById);
router.put('/:id', updateNoteById);
router.delete('/:id', deleteNoteById);
router.patch('/:id/toggle', toggleNoteCompleted); 

export default router;