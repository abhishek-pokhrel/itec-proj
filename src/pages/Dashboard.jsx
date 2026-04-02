import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut, Trash2, Check, Circle, Calendar, Layout } from 'lucide-react'
import { useAuth } from '../state/authContext'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import API from '../lib/api'
import CalendarView from '../components/CalendarView'
import TaskEditModal from '../components/TaskEditModal'
import { TaskService } from '../lib/taskService'
import { ProjectService } from '../lib/projectService'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [projectName, setProjectName] = useState('')
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')
  const [taskDueDate, setTaskDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('kanban') // 'kanban' or 'calendar'
  const [editingTask, setEditingTask] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
      const res = await ProjectService.getAllProjects()
      setProjects(res)
      if (res.length > 0 && !selectedProjectId) {
        setSelectedProjectId(res[0]._id)
      }
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const fetchTasks = async () => {
    try {
      const res = await TaskService.getTasksByProject(selectedProjectId)
      setTasks(res)
    } catch (err) {
      setError('Failed to load tasks')
    }
  }

  const addProject = async () => {
    if (!projectName.trim()) return
    try {
      const res = await ProjectService.createProject({ name: projectName })
      setProjects([...projects, res])
      setSelectedProjectId(res._id)
      setProjectName('')
    } catch (err) {
      setError('Failed to create project')
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await ProjectService.deleteProject(id)
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
      const res = await TaskService.createTask({
        title: taskTitle,
        description: taskDescription,
        status: 'todo',
        priority: taskPriority,
        dueDate: taskDueDate || undefined,
        projectId: selectedProjectId
      })
      setTasks([...tasks, res])
      setTaskTitle('')
      setTaskDescription('')
      setTaskPriority('medium')
      setTaskDueDate('')
    } catch (err) {
      setError('Failed to create task')
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await TaskService.updateTaskStatus(taskId, newStatus)
      setTasks(tasks.map(t => t._id === taskId ? res : t))
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const deleteTask = async (id) => {
    try {
      await TaskService.deleteTask(id)
      setTasks(tasks.filter(t => t._id !== id))
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowEditModal(true)
  }

  const handleSaveTask = (updatedTask) => {
    setTasks(tasks.map(t => t._id === updatedTask._id ? updatedTask : t))
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t._id !== taskId))
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
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900">Title</h1>
          <p className="text-xs text-slate-500 mt-2 font-medium">{user?.name}</p>
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 border-b border-slate-200">
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">📊 Overview</button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">� Analytics</button>
            <button className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">🔔 Activity</button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase text-slate-500 tracking-wide">Projects</h2>
            <button
              onClick={addProject}
              className="text-slate-400 hover:text-slate-600 transition p-1"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1 mb-4">
            {projects.map(project => (
              <div
                key={project._id}
                className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between group transition ${
                  selectedProjectId === project._id
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div
                  onClick={() => setSelectedProjectId(project._id)}
                  className="flex-1 min-w-0"
                >
                  <p className="font-semibold text-sm truncate">{project.name}</p>
                  <p className="text-xs opacity-70">
                    {tasks.filter(t => t.projectId === project._id).length} tasks
                  </p>
                </div>
                <button
                  onClick={() => deleteProject(project._id)}
                  className="opacity-0 group-hover:opacity-100 transition p-1 hover:text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-500 text-xs">No projects yet</p>
            </div>
          )}

          {/* Add Project Input */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <Input
              placeholder="New project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addProject()}
              className="text-sm h-9 flex-1"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-sm flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900">
            {projects.find(p => p._id === selectedProjectId)?.name || 'Select a project'}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setView('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                view === 'kanban'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layout className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                view === 'calendar'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200">
              {error}
            </div>
          )}

          {!selectedProjectId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-500 text-lg mb-4">Create a project to get started</p>
              </div>
            </div>
          ) : view === 'calendar' ? (
            // Calendar View
            <CalendarView projectId={selectedProjectId} />
          ) : (
            // Kanban View
            <>
              {/* Add Task Form */}
              <div className="mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Create New Task</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Task title..."
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTask()}
                    className="w-full text-sm"
                  />
                  <textarea
                    placeholder="Task description (optional)..."
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm resize-none"
                    rows="2"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Priority</label>
                      <select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 mb-1 block">Due Date</label>
                      <Input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addTask} className="w-full flex items-center justify-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kanban Board */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[
                  { id: 'todo', label: 'Open', color: 'slate', dotColor: 'bg-slate-400' },
                  { id: 'in-progress', label: 'In Progress', color: 'indigo', dotColor: 'bg-indigo-500' },
                  { id: 'done', label: 'Done', color: 'emerald', dotColor: 'bg-emerald-500' }
                ].map(col => (
                  <div key={col.id}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`h-2 w-2 rounded-full ${col.dotColor}`}></span>
                      <h3 className="font-bold text-slate-900 text-sm">{col.label}</h3>
                      <span className="text-xs font-semibold text-slate-400">
                        {tasks.filter(t => t.status === col.id).length}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {tasks
                        .filter(t => t.status === col.id)
                        .map(task => (
                          <div
                            key={task._id}
                            onClick={() => handleEditTask(task)}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition cursor-pointer group"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-slate-900 font-semibold text-sm">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTask(task._id)
                                }}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition p-1 hover:text-rose-600 flex-shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Priority & Due Date */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {task.priority && (
                                <span className={`text-xs px-2 py-1 rounded font-semibold ${
                                  task.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                                  task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                                  'bg-cyan-100 text-cyan-700'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-semibold">
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateTaskStatus(task._id, 'todo')
                                  }}
                                  className="text-xs px-2 py-1 rounded text-slate-600 hover:bg-slate-100 transition"
                                >
                                  ← Back
                                </button>
                              )}
                              {col.id !== 'done' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateTaskStatus(task._id, col.id === 'todo' ? 'in-progress' : 'done')
                                  }}
                                  className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition font-medium flex-1"
                                >
                                  {col.id === 'todo' ? 'Start →' : 'Complete ✓'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                      {tasks.filter(t => t.status === col.id).length === 0 && (
                        <div className="text-center py-8 text-slate-400">
                          <p className="text-xs">No tasks yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task Edit Modal */}
      {showEditModal && editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => {
            setShowEditModal(false)
            setEditingTask(null)
          }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  )
}

