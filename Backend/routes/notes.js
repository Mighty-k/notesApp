const express = require('express');
const Note = require('../models/note');
const auth = require('../middleware/auth');

const notesRouter = express.Router();

// Get all notes for a user
notesRouter.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Create a new note
notesRouter.post('/', auth, async (req, res) => {
  const { title, content, date } = req.body;

  try {
    const newNote = new Note({ title, content, date, userId: req.user.id });
    await newNote.save();

    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Update a note
notesRouter.put('/:id', auth, async (req, res) => {
  const { title, content, date } = req.body;

  try {
    const note = await Note.findById(req.params.id);
    if (!note || note.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    note.title = title || note.title;
    note.content = content || note.content;
    note.data = date || note.date
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Delete a note
notesRouter.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    // console.log(note)
    if (!note || note.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    await note.deleteOne();
    res.status(200).json({ message: 'Note deleted successfully' });
    // console.log('note deleted successfully');
    
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
    // console.log('server error');
  }
});

module.exports = notesRouter;
