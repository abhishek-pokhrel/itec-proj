const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const taskRoutes = require('./routes/tasks')
const labelRoutes = require('./routes/labels')
const noteRoutes = require('./routes/notes')
const todoRoutes = require('./routes/todos')
const commentRoutes = require('./routes/comments')
const attachmentRoutes = require('./routes/attachments')
const timelogRoutes = require('./routes/timelogs')
const notificationRoutes = require('./routes/notifications')
const projectMemberRoutes = require('./routes/projectMembers')
const settingsRoutes = require('./routes/settings')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://itec-proj.vercel.app',
  'https://www.itec-proj.vercel.app'
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  family: 4 // Use IPv4 to avoid network issues
})
.then(() => console.log('MongoDB connected'))
.catch(err => {
  console.log('MongoDB connection error:', err.message)
  console.log('Retrying connection in 3 seconds...')
  setTimeout(() => {
    mongoose.connect(process.env.MONGODB_URI)
  }, 3000)
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/projects/:projectId/members', projectMemberRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/labels', labelRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/attachments', attachmentRoutes)
app.use('/api/timelogs', timelogRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/settings', settingsRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})