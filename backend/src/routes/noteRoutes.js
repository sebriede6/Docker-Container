const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// Route für Notizen
router.get('/notes', noteController.getAllNotes);
router.post('/notes', noteController.createNote);
router.delete('/notes/:id', noteController.deleteNoteById);
router.put('/:id', noteController.updateNoteById);
module.exports = router;