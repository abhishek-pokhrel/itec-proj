const express = require('express')
const Project = require('../models/Project')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/projects
// @desc    Get all projects for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id })
    res.json(projects)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST /api/projects
// @desc    Create a project
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name } = req.body

  try {
    const newProject = new Project({
      name,
      userId: req.user.id,
    })

    const project = await newProject.save()
    res.json(project)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name } = req.body

  try {
    let project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: { name } },
      { new: true }
    )

    res.json(project)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let project = await Project.findById(req.params.id)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await Project.findByIdAndRemove(req.params.id)
    res.json({ message: 'Project removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router