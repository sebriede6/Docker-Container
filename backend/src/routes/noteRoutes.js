import express from 'express';
import * as noteController from '../controllers/noteController.js';

const router = express.Router();


router.get('/', noteController.getAllNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNoteById); // Hinzugefügt für Konsistenz, falls getNoteById auch hierüber laufen soll
router.put('/:id', noteController.updateNoteById);
router.delete('/:id', noteController.deleteNoteById);

export default router;