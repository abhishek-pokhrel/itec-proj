const mongoose = require('mongoose')

const projectMemberSchema = new mongoose.Schema({
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
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

projectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true })
projectMemberSchema.index({ userId: 1 })

module.exports = mongoose.model('ProjectMember', projectMemberSchema)
