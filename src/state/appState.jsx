import React, { useEffect, useMemo, useReducer } from 'react'
import { AppContext } from './appContext'
import seedData from '../data/seedData.json'

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

const initialData = { ...seedData, _meta: { minutesToHhMm } }

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialData
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return initialData
    const projects = parsed.projects ?? initialData.projects
    const selectedProjectId =
      parsed.ui?.selectedProjectId && projects.some((p) => p.id === parsed.ui.selectedProjectId)
        ? parsed.ui.selectedProjectId
        : projects[0]?.id ?? null

    const tasksByProject = parsed.tasksByProject ?? initialData.tasksByProject
    const tasks = tasksByProject[selectedProjectId] ?? []
    const selectedTaskId =
      parsed.ui?.selectedTaskId && tasks.some((t) => t.id === parsed.ui.selectedTaskId)
        ? parsed.ui.selectedTaskId
        : tasks[0]?.id ?? null

    return {
      ...initialData,
      ...parsed,
      ui: {
        ...initialData.ui,
        ...(parsed.ui ?? {}),
        selectedProjectId,
        selectedTaskId,
      },
      projects,
      tasksByProject,
      notes: parsed.notes ?? initialData.notes,
      todos: parsed.todos ?? initialData.todos,
      _meta: { minutesToHhMm },
    }
  } catch {
    return initialData
  }
}

function reducer(state, action) {
  switch (action.type) {
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
      const name = action.name?.trim()
      if (!name) return state
      const newProjectId = uid('proj')
      return {
        ...state,
        projects: [...state.projects, { id: newProjectId, name }],
        tasksByProject: {
          ...state.tasksByProject,
          [newProjectId]: state.tasksByProject[newProjectId] ?? [],
        },
        ui: {
          ...state.ui,
          selectedProjectId: newProjectId,
          selectedTaskId: null,
        },
      }
    }
    case 'task/add': {
      const { projectId, status, title } = action
      if (!projectId) return state
      const newTask = {
        id: uid('task'),
        title: title?.trim() || 'Untitled task',
        headline: 'Small and concise headline',
        description: '',
        createdAt: new Date().toISOString(),
        deadlineAt: new Date(`${todayISO()}T18:00:00.000Z`).toISOString(),
        trackedMinutes: 0,
        priority: 'small',
        assignee: { name: 'user', avatarText: 'u' },
        groupPath: ['Projects', state.projects.find((p) => p.id === projectId)?.name ?? 'Project'],
        tags: [{ id: uid('tag'), label: 'New', tone: 'cyan' }],
        status,
      }
      const existing = state.tasksByProject[projectId] ?? []
      return {
        ...state,
        ui: { ...state.ui, selectedProjectId: projectId, selectedTaskId: newTask.id },
        tasksByProject: {
          ...state.tasksByProject,
          [projectId]: [newTask, ...existing],
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

  useEffect(() => {
    const toStore = { ...state }
    delete toStore._meta
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
  }, [state])

  const api = useMemo(() => {
    const projectId = state.ui.selectedProjectId
    const tasks = state.tasksByProject[projectId] ?? []
    const task = tasks.find((t) => t.id === state.ui.selectedTaskId) ?? tasks[0] ?? null
    const allTasks = Object.values(state.tasksByProject).flat()
    return {
      state,
      dispatch,
      derived: { tasks, task, allTasks, minutesToHhMm },
    }
  }, [state])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

