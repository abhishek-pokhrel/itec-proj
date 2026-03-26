const express = require('express')
const Todo = require('../models/Todo')
const auth = require('../middleware/auth')

const router = express.Router()

// @route   GET /api/todos
// @desc    Get all todos for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id })
    res.json(todos)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   POST /api/todos
// @desc    Create a todo
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title } = req.body

  try {
    const newTodo = new Todo({
      title,
      userId: req.user.id,
    })

    const todo = await newTodo.save()
    res.json(todo)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   PUT /api/todos/:id
// @desc    Update a todo
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, completed } = req.body

  try {
    let todo = await Todo.findById(req.params.id)
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' })
    }

    if (todo.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: { title, completed } },
      { new: true }
    )

    res.json(todo)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

// @route   DELETE /api/todos/:id
// @desc    Delete a todo
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let todo = await Todo.findById(req.params.id)
    if (!todo) {
      return res.status(404).json({ message: 'Todo not found' })
    }

    if (todo.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    await Todo.findByIdAndRemove(req.params.id)
    res.json({ message: 'Todo removed' })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router