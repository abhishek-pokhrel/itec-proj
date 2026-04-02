const express = require('express')
const auth = require('../middleware/auth')
const Label = require('../models/Label')
const Project = require('../models/Project')

const router = express.Router()

// Get all labels for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params
    const labels = await Label.find({
      projectId,
      userId: req.user.id,
    }).sort({ createdAt: -1 })
    res.json(labels)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Create label
router.post('/', auth, async (req, res) => {
  const { name, color, projectId } = req.body

  // Verify user owns the project
  const project = await Project.findOne({ _id: projectId, userId: req.user.id })
  if (!project) {
    return res.status(403).json({ message: 'Not authorized' })
  }

  const label = new Label({
    name,
    color,
    projectId,
    userId: req.user.id,
  })

  try {
    const savedLabel = await label.save()
    res.status(201).json(savedLabel)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Update label
router.patch('/:id', auth, async (req, res) => {
  try {
    const label = await Label.findOne({ _id: req.params.id, userId: req.user.id })
    if (!label) {
      return res.status(404).json({ message: 'Label not found' })
    }

    if (req.body.name) label.name = req.body.name
    if (req.body.color) label.color = req.body.color

    const updatedLabel = await label.save()
    res.json(updatedLabel)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

// Delete label
router.delete('/:id', auth, async (req, res) => {
  try {
    const label = await Label.findOne({ _id: req.params.id, userId: req.user.id })
    if (!label) {
      return res.status(404).json({ message: 'Label not found' })
    }

    await Label.deleteOne({ _id: req.params.id })
    res.json({ message: 'Label deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
