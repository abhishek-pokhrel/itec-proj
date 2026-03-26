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
app.use(cors())
app.use(express.json())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/todos', todoRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})