const express = require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/tasks
// @desc    Get all tasks for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).populate('projectId')
    res.json(tasks)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   GET /api/tasks/project/:projectId
// @desc    Get tasks for a project
// @access  Private
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId, userId: req.user.id })
    res.json(tasks)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST /api/tasks
// @desc    Create a task
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, dueDate, projectId } = req.body

  try {
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      userId: req.user.id,
    })

    const task = await newTask.save()
    res.json(task)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, dueDate } = req.body

  try {
    let task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, status, priority, dueDate } },
      { new: true }
    )

    res.json(task)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await Task.findByIdAndRemove(req.params.id)
    res.json({ message: 'Task removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router