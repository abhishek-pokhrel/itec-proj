import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut, Trash2, Check, Circle } from 'lucide-react'
import { useAuth } from '../state/authContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import API from '../lib/api'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [projectName, setProjectName] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load projects on mount
  useEffect(() => {
    fetchProjects()
  }, [])

  // Load tasks when project changes
  useEffect(() => {
    if (selectedProjectId) {
      fetchTasks()
    }
  }, [selectedProjectId])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const res = await API.get('/projects')
      setProjects(res.data)
      if (res.data.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res.data[0]._id)
      }
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await API.get(`/tasks?projectId=${selectedProjectId}`)
      setTasks(res.data)
    } catch (err) {
      setError('Failed to load tasks')
    }
  }

  const addProject = async () => {
    if (!projectName.trim()) return
    try {
      const res = await API.post('/projects', { name: projectName })
      setProjects([...projects, res.data])
      setSelectedProjectId(res.data._id)
      setProjectName('')
    } catch (err) {
      setError('Failed to create project')
    }
  }

  const deleteProject = async (id) => {
    try {
      await API.delete(`/projects/${id}`)
      setProjects(projects.filter(p => p._id !== id))
      if (selectedProjectId === id) {
        setSelectedProjectId(projects[0]?._id || null)
        setTasks([])
      }
    } catch (err) {
      setError('Failed to delete project')
    }
  }

  const addTask = async () => {
    if (!taskTitle.trim() || !selectedProjectId) return
    try {
      const res = await API.post('/tasks', {
        title: taskTitle,
        status: 'todo',
        projectId: selectedProjectId
      })
      setTasks([...tasks, res.data])
      setTaskTitle('')
    } catch (err) {
      setError('Failed to create task')
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await API.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(tasks.map(t => t._id === taskId ? res.data : t))
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const deleteTask = async (id) => {
    try {
      await API.delete(`/tasks/${id}`)
      setTasks(tasks.filter(t => t._id !== id))
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-indigo-600">TaskHub</h1>
          <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase text-gray-500 mb-3">Projects</h2>
            <div className="flex gap-2">
              <Input
                placeholder="New project..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addProject()}
                className="text-sm h-9"
              />
              <Button
                onClick={addProject}
                size="sm"
                className="flex-shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {projects.map(project => (
              <div
                key={project._id}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between group transition ${
                  selectedProjectId === project._id
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div
                  onClick={() => setSelectedProjectId(project._id)}
                  className="flex-1"
                >
                  <p className="font-semibold text-sm">{project.name}</p>
                  <p className="text-xs opacity-75">
                    {tasks.filter(t => t.projectId === project._id).length} tasks
                  </p>
                </div>
                <button
                  onClick={() => deleteProject(project._id)}
                  className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No projects yet. Create one!</p>
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="p-4 border-t">
          <Button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {projects.find(p => p._id === selectedProjectId)?.name || 'Select a project'}
          </h2>
        </div>

        {/* Tasks */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!selectedProjectId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-4">Create a project to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Add Task */}
              <div className="mb-6 flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1"
                />
                <Button onClick={addTask} className="flex-shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Tasks by Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['todo', 'in-progress', 'done'].map(status => (
                  <div key={status}>
                    <h3 className="font-semibold text-gray-900 mb-4 capitalize text-sm">
                      {status === 'in-progress' ? 'In Progress' : status}
                    </h3>
                    <div className="space-y-3">
                      {tasks
                        .filter(t => t.status === status)
                        .map(task => (
                          <div
                            key={task._id}
                            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border-l-4 border-indigo-500"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-gray-900 font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteTask(task._id)}
                                className="ml-2 opacity-0 hover:opacity-100 transition p-1"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                            </div>

                            {/* Status Buttons */}
                            <div className="flex gap-2 mt-3">
                              {['todo', 'in-progress', 'done'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateTaskStatus(task._id, s)}
                                  className={`px-2 py-1 rounded text-xs font-semibold transition ${
                                    task.status === s
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                >
                                  {s === 'in-progress' ? 'In Prog' : s === 'todo' ? 'Todo' : 'Done'}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {tasks.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No tasks yet. Create one to get started!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

