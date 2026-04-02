const mongoose = require('mongoose')

const attachmentSchema = new mongoose.Schema({
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
  fileName: {
    type: String,
    required: true,
  },
  fileSize: Number,
  fileType: String,
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
})

attachmentSchema.index({ taskId: 1, uploadedAt: -1 })

module.exports = mongoose.model('Attachment', attachmentSchema)
