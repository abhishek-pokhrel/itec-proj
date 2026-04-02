const mongoose = require('mongoose')

const timeLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  duration: {
    type: Number,
    required: true, // in minutes
  },
  note: String,
  date: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

timeLogSchema.index({ taskId: 1, date: -1 })
timeLogSchema.index({ userId: 1, date: -1 })

module.exports = mongoose.model('TimeLog', timeLogSchema)
