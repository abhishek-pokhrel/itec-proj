const express = require('express')
const Note = require('../models/Note')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/notes
// @desc    Get all notes for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id })
    res.json(notes)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST /api/notes
// @desc    Create a note
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, content } = req.body

  try {
    const newNote = new Note({
      title,
      content,
      userId: req.user.id,
    })

    const note = await newNote.save()
    res.json(note)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, content } = req.body

  try {
    let note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: { title, content } },
      { new: true }
    )

    res.json(note)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id)
    if (!note) {
      return res.status(404).json({ message: 'Note not found' })
    }

    if (note.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await Note.findByIdAndRemove(req.params.id)
    res.json({ message: 'Note removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router