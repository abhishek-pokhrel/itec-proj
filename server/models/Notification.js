const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  },
  type: {
    type: String,
    enum: ['due_soon', 'overdue', 'mentioned', 'assigned', 'completed', 'comment'],
    required: true,
  },
  title: String,
  message: String,
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })

module.exports = mongoose.model('Notification', notificationSchema)
