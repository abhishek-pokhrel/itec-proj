import API from './api'

export const TaskService = {
  // Get all tasks
  getAllTasks: async () => {
    try {
      const res = await API.get('/tasks')
      return res.data
    } catch (err) {
      console.error('Error fetching tasks:', err)
      throw err
    }
  },

  // Get tasks by project
  getTasksByProject: async (projectId) => {
    try {
      const res = await API.get(`/tasks?projectId=${projectId}`)
      return res.data
    } catch (err) {
      console.error('Error fetching tasks for project:', err)
      throw err
    }
  },

  // Get single task
  getTask: async (taskId) => {
    try {
      const res = await API.get(`/tasks/${taskId}`)
      return res.data
    } catch (err) {
      console.error('Error fetching task:', err)
      throw err
    }
  },

  // Create task
  createTask: async (taskData) => {
    try {
      const res = await API.post('/tasks', taskData)
      return res.data
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  },

  // Update task
  updateTask: async (taskId, taskData) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, taskData)
      return res.data
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      const res = await API.delete(`/tasks/${taskId}`)
      return res.data
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  },

  // Update task status (for kanban)
  updateTaskStatus: async (taskId, status) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status })
      return res.data
    } catch (err) {
      console.error('Error updating task status:', err)
      throw err
    }
  },

  // Get tasks by status
  getTasksByStatus: async (projectId, status) => {
    try {
      const tasks = await TaskService.getTasksByProject(projectId)
      return tasks.filter(task => task.status === status)
    } catch (err) {
      console.error('Error filtering tasks:', err)
      throw err
    }
  },

  // Get tasks by date range (for calendar)
  getTasksByDateRange: async (projectId, startDate, endDate) => {
    try {
      const tasks = await TaskService.getTasksByProject(projectId)
      return tasks.filter(task => {
        if (!task.dueDate) return false
        const taskDate = new Date(task.dueDate)
        return taskDate >= startDate && taskDate <= endDate
      })
    } catch (err) {
      console.error('Error filtering tasks by date:', err)
      throw err
    }
  },

  // Get tasks for a specific date
  getTasksByDate: async (projectId, date) => {
    try {
      const tasks = await TaskService.getTasksByProject(projectId)
      const targetDate = new Date(date).toDateString()
      return tasks.filter(task => {
        if (!task.dueDate) return false
        return new Date(task.dueDate).toDateString() === targetDate
      })
    } catch (err) {
      console.error('Error filtering tasks by date:', err)
      throw err
    }
  },

  // Search and filter tasks
  searchTasks: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (projectId) params.append('projectId', projectId)
      if (filters.status) params.append('status', filters.status)
      if (filters.priority) params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      if (filters.labelId) params.append('labelId', filters.labelId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const res = await API.get(`/tasks/search/query?${params.toString()}`)
      return res.data
    } catch (err) {
      console.error('Error searching tasks:', err)
      throw err
    }
  },

  // Add subtask
  addSubtask: async (taskId, title) => {
    try {
      const res = await API.post(`/tasks/${taskId}/subtasks`, { title })
      return res.data
    } catch (err) {
      console.error('Error adding subtask:', err)
      throw err
    }
  },

  // Update subtask
  updateSubtask: async (taskId, subtaskId, data) => {
    try {
      const res = await API.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
      return res.data
    } catch (err) {
      console.error('Error updating subtask:', err)
      throw err
    }
  },

  // Delete subtask
  deleteSubtask: async (taskId, subtaskId) => {
    try {
      const res = await API.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
      return res.data
    } catch (err) {
      console.error('Error deleting subtask:', err)
      throw err
    }
  },
}
