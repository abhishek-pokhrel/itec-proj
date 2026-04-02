const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light',
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: String,
      default: '09:00',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    defaultView: {
      type: String,
      enum: ['kanban', 'calendar', 'list'],
      default: 'kanban',
    },
  },
}, {
  timestamps: true,
})

module.exports = mongoose.model('User', userSchema)