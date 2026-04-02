import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut, Trash2, Check, Circle, Calendar, Layout, Moon, Sun, BarChart3, Eye } from 'lucide-react'
import { useAuth } from '../state/authContext'
import { useApp } from '../state/useApp'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'
import UserProfile from '../components/UserProfile'
import NotificationCenter from '../components/NotificationCenter'
import API from '../lib/api'
import CalendarView from '../components/CalendarView'
import TaskEditModal from '../components/TaskEditModal'
import { TaskService } from '../lib/taskService'
import { ProjectService } from '../lib/projectService'
import { OverviewPage } from '../components/OverviewPage'
import Analytics from './Analytics'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { state, dispatch } = useApp()
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
  const [darkMode, setDarkMode] = useState(false)
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
      // Update app state for Analytics
      dispatch({ type: 'project/delete', projectId: id })
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
      // Update app state for Analytics
      const taskWithStringIds = {
        ...res,
        id: res._id ? res._id.toString() : res._id,
        projectId: res.projectId ? res.projectId.toString() : res.projectId
      }
      dispatch({ type: 'task/add', task: taskWithStringIds })
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
      // Update app state for Analytics
      dispatch({ type: 'task/moveStatus', projectId: selectedProjectId, taskId: taskId, status: newStatus })
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const deleteTask = async (id) => {
    try {
      await TaskService.deleteTask(id)
      setTasks(tasks.filter(t => t._id !== id))
      // Update app state for Analytics
      dispatch({ type: 'task/delete', projectId: selectedProjectId, taskId: id })
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
    // Update app state for Analytics
    const taskWithStringIds = {
      ...updatedTask,
      id: updatedTask._id ? updatedTask._id.toString() : updatedTask._id,
      projectId: updatedTask.projectId ? updatedTask.projectId.toString() : updatedTask.projectId
    }
    dispatch({ type: 'task/update', projectId: selectedProjectId, taskId: updatedTask._id, patch: taskWithStringIds })
  }

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(t => t._id !== taskId))
    // Update app state for Analytics
    dispatch({ type: 'task/delete', projectId: selectedProjectId, taskId: taskId })
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
    <div className={`flex h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <div className={`w-64 border-r flex flex-col shadow-md transition-colors duration-300 ${
        darkMode
          ? 'bg-gradient-to-b from-slate-800 via-slate-800 to-slate-900 border-slate-700'
          : 'bg-gradient-to-b from-white via-slate-50 to-slate-100 border-slate-300'
      }`}>
        {/* Logo/Header */}
        <div className={`p-6 border-b transition-colors duration-300 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-800 to-slate-700 border-slate-700'
            : 'bg-gradient-to-r from-white to-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-900 via-blue-900 to-slate-800 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h1 className={`text-lg font-bold bg-clip-text ${
                darkMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent'
              }`}>TaskFlow</h1>
              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Task Manager</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mb-4">
            <p className={`text-xs font-bold uppercase tracking-wide mb-3 px-2 ${
              darkMode ? 'text-slate-400' : 'text-slate-600'
            }`}>Projects</p>
            <div className="space-y-2">
              {projects.map(project => (
                <div
                  key={project._id}
                  onClick={() => setSelectedProjectId(project._id)}
                  className={`group relative px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 flex items-start justify-between ${
                    selectedProjectId === project._id
                      ? darkMode
                        ? 'bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 border border-blue-700 text-white shadow-md'
                        : 'bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100 border border-blue-300 text-blue-900 shadow-md'
                      : darkMode
                      ? 'hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-600 text-slate-300'
                      : 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${
                      selectedProjectId === project._id
                        ? darkMode ? 'text-white' : 'text-indigo-900'
                        : darkMode ? 'text-slate-200' : 'text-slate-900'
                    }`}>{project.name}</p>
                    
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteProject(project._id)
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition p-1 rounded ml-2 flex-shrink-0 ${
                      darkMode
                        ? 'hover:bg-rose-900/40 hover:text-rose-400'
                        : 'hover:bg-gradient-to-br hover:from-rose-100 hover:to-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {projects.length === 0 && (
            <div className="text-center py-8">
              <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>No projects yet</p>
            </div>
          )}

          {/* Add Project Input */}
          <div className={`flex gap-2 pt-4 border-t mt-4 transition-colors duration-300 ${
            darkMode ? 'border-slate-700' : 'border-slate-200'
          }`}>
            <Input
              placeholder="New project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addProject()}
              className={`text-sm h-9 flex-1 text-xs ${
                darkMode
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                  : ''
              }`}
            />
            <button
              onClick={addProject}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition font-semibold text-xs"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t space-y-4 transition-colors duration-300 ${
          darkMode ? 'border-slate-700' : 'border-slate-200'
        }`}>
          <UserProfile user={user} />
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 hover:shadow-lg transition duration-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-colors duration-300 ${
        darkMode
          ? 'bg-gradient-to-br from-slate-900 to-slate-800'
          : 'bg-gradient-to-br from-slate-50 to-slate-100'
      }`}>
        {/* Header */}
        <div className={`border-b px-8 py-6 shadow-md sticky top-0 z-20 transition-colors duration-300 ${
          darkMode
            ? 'bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 border-slate-700'
            : 'bg-gradient-to-r from-white via-indigo-50 to-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-4xl font-bold ${
                darkMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-slate-900 via-indigo-700 to-slate-900 bg-clip-text text-transparent'
              }`}>
                {projects.find(p => p._id === selectedProjectId)?.name || 'Select a project'}
              </h2>
              <p className={`text-sm font-semibold mt-1 ${
                darkMode ? 'text-slate-300' : 'bg-gradient-to-r from-slate-500 to-slate-600 bg-clip-text text-transparent'
              }`}>
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition ${
                  darkMode
                    ? 'hover:bg-slate-700 text-amber-400'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
                title={darkMode ? 'Light mode' : 'Dark mode'}
              >
                {darkMode ? (
                  <Sun size={20} className="text-amber-400" />
                ) : (
                  <Moon size={20} className="text-slate-600" />
                )}
              </button>
              <NotificationCenter />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => dispatch({ type: 'ui/setNav', nav: 'projects' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                state.ui.activeNav === 'projects'
                  ? 'bg-gradient-to-r from-blue-900 via-blue-900 to-slate-800 text-white shadow-lg'
                  : darkMode
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500'
                  : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600 hover:from-slate-300 hover:to-slate-400'
              }`}
            >
              <Layout className="h-4 w-4" />
              Kanban
            </button>
            <button
              onClick={() => dispatch({ type: 'ui/setNav', nav: 'calendar' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                state.ui.activeNav === 'calendar'
                  ? 'bg-gradient-to-r from-blue-900 via-blue-900 to-slate-800 text-white shadow-lg'
                  : darkMode
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500'
                  : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600 hover:from-slate-300 hover:to-slate-400'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => dispatch({ type: 'ui/setNav', nav: 'analytics' })}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition duration-200 ${
                state.ui.activeNav === 'analytics'
                  ? 'bg-gradient-to-r from-blue-900 via-blue-900 to-slate-800 text-white shadow-lg'
                  : darkMode
                  ? 'bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 hover:from-slate-600 hover:to-slate-500'
                  : 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-600 hover:from-slate-300 hover:to-slate-400'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </button>
          </div>
        </div>

        {/* Main Area */}
        <div className={`flex-1 overflow-y-auto px-8 py-8 ${darkMode ? 'bg-slate-900' : ''}`}>
          {error && (
            <div className={`mb-6 p-4 rounded-lg text-sm border flex items-start gap-3 ${
              darkMode
                ? 'bg-rose-900/30 text-rose-300 border-rose-700/50'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {state.ui.activeNav === 'overview' ? (
            <OverviewPage darkMode={darkMode} />
          ) : state.ui.activeNav === 'analytics' ? (
            <Analytics darkMode={darkMode} />
          ) : !selectedProjectId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className={`w-16 h-16 mx-auto mb-4 ${darkMode ? 'text-slate-600' : 'text-slate-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m0 0h6m0 0h-6m-6-6H6" />
                </svg>
                <p className={`text-lg font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>Create a project to get started</p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>Use the sidebar to add your first project</p>
              </div>
            </div>
          ) : state.ui.activeNav === 'calendar' ? (
            // Calendar View
            <CalendarView projectId={selectedProjectId} />
          ) : (
            // Kanban View
            <>
              {/* Add Task Form */}
              <div className={`mb-8 rounded-xl border shadow-md hover:shadow-lg transition-shadow p-6 ${
                darkMode
                  ? 'bg-gradient-to-br from-slate-800 via-slate-800 to-slate-700 border-slate-700'
                  : 'bg-gradient-to-br from-white via-slate-50 to-slate-100 border-slate-300'
              }`}>
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-2 bg-gradient-to-br from-blue-900 to-slate-800 rounded-lg">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Create New Task</h3>
                </div>
                <div className="space-y-4">
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
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none transition duration-200"
                    rows="2"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Priority</label>
                      <Select
                        value={taskPriority}
                        onChange={(e) => setTaskPriority(e.target.value)}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-2 block">Due Date</label>
                      <Input
                        type="date"
                        value={taskDueDate}
                        onChange={(e) => setTaskDueDate(e.target.value)}
                        className="w-full text-sm"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addTask} className="w-full flex items-center justify-center gap-2 h-10">
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
                  <div key={col.id} className="flex flex-col">
                    <div className="flex items-center gap-2 mb-5 px-2">
                      <span className={`h-3 w-3 rounded-full ${col.dotColor} shadow-sm`}></span>
                      <h3 className="font-bold text-slate-900 text-base">{col.label}</h3>
                      <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full">
                        {tasks.filter(t => t.status === col.id).length}
                      </span>
                    </div>
                    <div className="space-y-3 flex-1">
                      {tasks
                        .filter(t => t.status === col.id)
                        .map(task => (
                          <div
                            key={task._id}
                            onClick={() => handleEditTask(task)}
                            className="bg-gradient-to-br from-white to-slate-50 p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer group relative"
                          >
                            <div className="absolute top-0 left-0 h-1 w-full rounded-t-lg bg-gradient-to-r" style={{
                              backgroundImage: task.priority === 'high' ? 'linear-gradient(90deg, #f43f5e, #be123c)' : task.priority === 'medium' ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #06b6d4, #0891b2)'
                            }}></div>

                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex-1 min-w-0 pt-2">
                                <p className="text-slate-900 font-semibold text-sm leading-tight">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{task.description}</p>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTask(task._id)
                                }}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition p-1.5 hover:bg-gradient-to-br hover:from-rose-50 hover:to-rose-100 hover:text-rose-600 flex-shrink-0 rounded-md"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {/* Priority & Due Date */}
                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                              {task.priority && (
                                <span className={`text-xs px-2.5 py-1.5 rounded-full font-semibold bg-gradient-to-r ${
                                  task.priority === 'high' ? 'from-rose-100 to-rose-200 text-rose-700' :
                                  task.priority === 'medium' ? 'from-amber-100 to-amber-200 text-amber-700' :
                                  'from-cyan-100 to-cyan-200 text-cyan-700'
                                }`}>
                                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="text-xs bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 px-2.5 py-1.5 rounded-full font-semibold">
                                  📅 {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100">
                              {col.id !== 'todo' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    updateTaskStatus(task._id, 'todo')
                                  }}
                                  className="text-xs px-2.5 py-1.5 rounded-md text-slate-600 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 transition font-semibold"
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
                                  className="text-xs px-2.5 py-1.5 rounded-md bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 hover:from-indigo-100 hover:to-indigo-200 transition font-semibold flex-1 text-center"
                                >
                                  {col.id === 'todo' ? 'Start →' : 'Complete ✓'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                      {tasks.filter(t => t.status === col.id).length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                          <p className="text-sm font-medium">No tasks yet</p>
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

