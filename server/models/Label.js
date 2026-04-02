const mongoose = require('mongoose')

const labelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#3B82F6', // Blue color
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
}, {
  timestamps: true,
})

labelSchema.index({ userId: 1, projectId: 1 })

module.exports = mongoose.model('Label', labelSchema)
