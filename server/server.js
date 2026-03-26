const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth')
const projectRoutes = require('./routes/projects')
const taskRoutes = require('./routes/tasks')
const noteRoutes = require('./routes/notes')
const todoRoutes = require('./routes/todos')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://itec-proj.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

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
app.use('/api/tasks', taskRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/todos', todoRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})