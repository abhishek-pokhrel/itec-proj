const mongoose = require('mongoose')

const subtaskSchema = new mongoose.Schema({
  id: String,
  title: String,
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'done'],
    default: 'todo',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  dueDate: {
    type: Date,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  labels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Label',
  }],
  subtasks: [subtaskSchema],
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  estimatedHours: Number,
  actualHours: {
    type: Number,
    default: 0,
  },
  recurring: {
    enabled: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    endsOn: Date,
    daysOfWeek: [Number], // 0-6 for weekly
    parentTaskId: mongoose.Schema.Types.ObjectId,
  },
}, {
  timestamps: true,
})

// Create indexes for search and filtering
taskSchema.index({ projectId: 1, status: 1 })
taskSchema.index({ userId: 1, createdAt: -1 })
taskSchema.index({ title: 'text', description: 'text' })
taskSchema.index({ dueDate: 1 })

module.exports = mongoose.model('Task', taskSchema)