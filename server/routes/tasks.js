const express = require('express')
const Task = require('../models/Task')
const auth = require('../middleware/auth')
const mongoose = require('mongoose')

const router = express.Router()

// @route   GET /api/tasks/search
// @desc    Search and filter tasks
// @access  Private
router.get('/search/query', auth, async (req, res) => {
  try {
    const { projectId, status, priority, search, labelId, startDate, endDate } = req.query
    let query = { userId: req.user.id }

    if (projectId) query.projectId = projectId
    if (status) query.status = status
    if (priority) query.priority = priority
    if (search) {
      query.$text = { $search: search }
    }
    if (labelId) {
      query.labels = mongoose.Types.ObjectId(labelId)
    }
    if (startDate || endDate) {
      query.dueDate = {}
      if (startDate) query.dueDate.$gte = new Date(startDate)
      if (endDate) query.dueDate.$lte = new Date(endDate)
    }

    const tasks = await Task.find(query)
      .populate('projectId')
      .populate('labels')
      .sort({ dueDate: 1, priority: -1 })

    res.json(tasks)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   GET /api/tasks
// @desc    Get all tasks for user or filter by projectId
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { projectId } = req.query
    let query = { userId: req.user.id }
    if (projectId) {
      query.projectId = projectId
    }
    const tasks = await Task.find(query)
      .populate('projectId')
      .populate('labels')

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
      .populate('labels')
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
  const { title, description, status, priority, dueDate, projectId, labels } = req.body

  try {
    const newTask = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      labels,
      userId: req.user.id,
    })

    const task = await newTask.save()
    await task.populate('labels')
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
  const { title, description, status, priority, dueDate, labels } = req.body

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
      { $set: { title, description, status, priority, dueDate, labels } },
      { new: true }
    ).populate('labels')

    res.json(task)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST /api/tasks/:id/subtasks
// @desc    Add a subtask
// @access  Private
router.post('/:id/subtasks', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const subtask = {
      id: new mongoose.Types.ObjectId().toString(),
      title: req.body.title,
      completed: false,
    }

    task.subtasks.push(subtask)
    await task.save()
    res.json(task)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PATCH /api/tasks/:id/subtasks/:subtaskId
// @desc    Update subtask
// @access  Private
router.patch('/:id/subtasks/:subtaskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    const subtask = task.subtasks.id(req.params.subtaskId)
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' })
    }

    if (req.body.title) subtask.title = req.body.title
    if (req.body.completed !== undefined) subtask.completed = req.body.completed

    await task.save()
    res.json(task)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE /api/tasks/:id/subtasks/:subtaskId
// @desc    Delete subtask
// @access  Private
router.delete('/:id/subtasks/:subtaskId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    task.subtasks.id(req.params.subtaskId).remove()
    await task.save()
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

    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: 'Task removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId')
    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    if (task.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(task)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router