import React, { useEffect, useMemo, useReducer, useState } from 'react'
import { AppContext } from './appContext'
import seedData from '../data/seedData.json'
import API from '../lib/api'

const STORAGE_KEY = 'itec_task_manager_v2'

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

function minutesToHhMm(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h}H ${m.toString().padStart(2, '0')}M`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const initialData = { 
  projects: [],
  tasksByProject: {},
  notes: [],
  todos: [],
  ui: { activeNav: 'projects', selectedProjectId: null, selectedTaskId: null, viewMode: 'board' },
  _meta: { minutesToHhMm }
}

function loadState() {
  return initialData
}

function reducer(state, action) {
  switch (action.type) {
    case 'data/load': {
      const { projects, tasksByProject, notes, todos, selectedProjectId, selectedTaskId } = action.data
      return {
        ...state,
        projects,
        tasksByProject,
        notes,
        todos,
        ui: { ...state.ui, selectedProjectId, selectedTaskId },
      }
    }
    case 'ui/selectProject': {
      const selectedProjectId = action.projectId
      const tasks = state.tasksByProject[selectedProjectId] ?? []
      const selectedTaskId = tasks[0]?.id ?? null
      return {
        ...state,
        ui: { ...state.ui, selectedProjectId, selectedTaskId },
      }
    }
    case 'ui/selectTask': {
      return {
        ...state,
        ui: { ...state.ui, selectedTaskId: action.taskId },
      }
    }
    case 'ui/setNav': {
      return { ...state, ui: { ...state.ui, activeNav: action.nav } }
    }
    case 'ui/setViewMode': {
      return { ...state, ui: { ...state.ui, viewMode: action.viewMode } }
    }
    case 'ui/setEditingTask': {
      return { ...state, ui: { ...state.ui, editingTaskId: action.taskId ?? null } }
    }
    case 'project/add': {
      const project = action.project
      return {
        ...state,
        projects: [...state.projects, project],
        tasksByProject: {
          ...state.tasksByProject,
          [project.id]: [],
        },
        ui: {
          ...state.ui,
          selectedProjectId: project.id,
          selectedTaskId: null,
        },
      }
    }
    case 'task/add': {
      const task = action.task
      const projectId = task.projectId
      const existing = state.tasksByProject[projectId] ?? []
      return {
        ...state,
        ui: { ...state.ui, selectedProjectId: projectId, selectedTaskId: task.id },
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: [task, ...existing],
        },
      }
    }
    case 'task/update': {
      const { projectId, taskId, patch } = action
      const tasks = state.tasksByProject[projectId] ?? []
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        },
      }
    }
    case 'task/moveStatus': {
      const { projectId, taskId, status } = action
      const tasks = state.tasksByProject[projectId] ?? []
      return {
        ...state,
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
        },
      }
    }
    case 'note/add': {
      const newNote = {
        id: uid('note'),
        title: action.title?.trim() || 'Untitled',
        createdAt: new Date().toISOString(),
        excerpt: action.excerpt?.trim() || '—',
        tags: [{ id: uid('tag'), label: 'New', tone: 'cyan' }],
      }
      return { ...state, notes: [newNote, ...state.notes] }
    }
    case 'todo/add': {
      const title = action.title?.trim()
      if (!title) return state
      const newTodo = {
        id: uid('todo'),
        title,
        done: false,
        date: new Date().toISOString(),
        tags: [{ id: uid('tag'), label: 'New', tone: 'cyan' }],
      }
      return { ...state, todos: [newTodo, ...state.todos] }
    }
    case 'todo/toggle': {
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.todoId ? { ...todo, done: !todo.done } : todo,
        ),
      }
    }
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, tasksRes, notesRes, todosRes] = await Promise.all([
          API.get('/projects'),
          API.get('/tasks'),
          API.get('/notes'),
          API.get('/todos')
        ])
        const projects = projectsRes.data.map(p => ({ ...p, id: p._id ? p._id.toString() : p._id }))
        const tasks = tasksRes.data.map(t => ({ 
          ...t, 
          id: t._id ? t._id.toString() : t._id, 
          projectId: t.projectId ? t.projectId.toString() : t.projectId 
        }))
        const notes = notesRes.data
        const todos = todosRes.data

        const tasksByProject = tasks.reduce((acc, task) => {
          const projectId = String(task.projectId)
          if (!acc[projectId]) acc[projectId] = []
          acc[projectId].push(task)
          return acc
        }, {})

        const selectedProjectId = projects[0]?.id ?? null
        const selectedTaskId = tasksByProject[selectedProjectId]?.[0]?.id ?? null

        dispatch({ type: 'data/load', data: { projects, tasksByProject, notes, todos, selectedProjectId, selectedTaskId } })
      } catch (err) {
        console.error('Failed to load data', err)
      } finally {
        setLoading(false)
      }
    }

    if (localStorage.getItem('token')) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [])

  // Remove localStorage save
  // useEffect(() => {
  //   const toStore = { ...state }
  //   delete toStore._meta
  //   localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  // }, [state])

  const api = useMemo(() => {
    const projectId = state.ui.selectedProjectId
    const tasks = state.tasksByProject[projectId] ?? []
    const task = tasks.find((t) => t.id === state.ui.selectedTaskId) ?? tasks[0] ?? null
    const allTasks = Object.values(state.tasksByProject).flat()
    return {
      state,
      dispatch,
      derived: { tasks, task, allTasks, minutesToHhMm },
      loading,
    }
  }, [state, loading])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

