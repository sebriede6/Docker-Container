
const express = require('express');
const noteController = require('../controllers/noteController'); 
const router = express.Router();


router.get('/', noteController.getAllNotes);
router.post('/', noteController.createNote);
router.get('/:id', noteController.getNoteById);
router.delete('/:id', noteController.deleteNoteById);

module.exports = router;
