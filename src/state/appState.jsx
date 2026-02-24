import React, { useEffect, useMemo, useReducer } from 'react'
import { AppContext } from './appContext'

const STORAGE_KEY = 'itec_task_manager_v1'

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
  ui: {
    activeNav: 'projects',
    viewMode: 'calendar', // calendar | list
    selectedProjectId: 'proj_1',
    selectedTaskId: 'task_1',
  },
  projects: [
    { id: 'proj_1', name: 'Proj 1', count: 23 },
    { id: 'proj_2', name: 'Proj 2', count: 345 },
    { id: 'proj_3', name: 'Proj 3', count: 568 },
  ],
  tasksByProject: {
    proj_1: [
      {
        id: 'task_1',
        title: 'Task',
        headline: 'Small and Concise headline',
        description: 'Desc',
        createdAt: '2022-05-15T14:23:00.000Z',
        deadlineAt: '2022-05-20T17:00:00.000Z',
        trackedMinutes: 632,
        priority: 'small',
        assignee: { name: 'samir', avatarText: 'sa' },
        groupPath: ['Team projects', 'Fashion'],
        tags: [
          { id: 'tag_uni', label: 'University', tone: 'violet' },
          { id: 'tag_ai', label: 'AI', tone: 'emerald' },
          { id: 'tag_p', label: 'Person', tone: 'slate' },
        ],
        status: 'open', // open | in_progress | done
      },
      {
        id: 'task_2',
        title: 'Manage Finances',
        headline: 'Budget, bills, and tracking',
        description: 'Set budgets and track monthly expenses.',
        createdAt: '2023-03-01T08:00:00.000Z',
        deadlineAt: '2026-03-01T18:00:00.000Z',
        trackedMinutes: 110,
        priority: 'high',
        assignee: { name: 'user', avatarText: 'u' },
        groupPath: ['Personal', 'Finance'],
        tags: [
          { id: 'tag_fin', label: 'Finance', tone: 'cyan' },
          { id: 'tag_eco', label: 'Economic', tone: 'amber' },
        ],
        status: 'open',
      },
      {
        id: 'task_3',
        title: 'Build Physic',
        headline: 'Strength + wellness routine',
        description: 'Gym plan + weekly wellness checklist.',
        createdAt: '2023-03-06T08:00:00.000Z',
        deadlineAt: '2026-03-10T18:00:00.000Z',
        trackedMinutes: 45,
        priority: 'small',
        assignee: { name: 'user', avatarText: 'u' },
        groupPath: ['Health', 'Wellness'],
        tags: [
          { id: 'tag_health', label: 'Health', tone: 'emerald' },
          { id: 'tag_gym', label: 'Gym', tone: 'blue' },
        ],
        status: 'in_progress',
      },
      {
        id: 'task_4',
        title: 'Finish Assignment',
        headline: 'Submit on time',
        description: 'Wrap up the report and submit.',
        createdAt: '2023-03-08T08:00:00.000Z',
        deadlineAt: '2026-02-28T18:00:00.000Z',
        trackedMinutes: 0,
        priority: 'very_high',
        assignee: { name: 'user', avatarText: 'u' },
        groupPath: ['University', 'Courses'],
        tags: [
          { id: 'tag_uni2', label: 'University', tone: 'violet' },
          { id: 'tag_courses', label: 'Courses', tone: 'pink' },
        ],
        status: 'done',
      },
    ],
  },
  notes: [
    {
      id: 'note_1',
      title: 'C++ Tricks',
      createdAt: '2023-04-02T08:00:00.000Z',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut id dui mi. Fusce varius ...',
      tags: [
        { id: 'tag_tech', label: 'Tech', tone: 'slate' },
        { id: 'tag_ai2', label: 'AI', tone: 'emerald' },
      ],
    },
    {
      id: 'note_2',
      title: 'Notes on being a successful programmer',
      createdAt: '2023-04-03T08:00:00.000Z',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut id dui mi. Fusce varius ...',
      tags: [
        { id: 'tag_learning', label: 'Learning', tone: 'cyan' },
        { id: 'tag_self', label: 'Self-improvement', tone: 'violet' },
      ],
    },
    {
      id: 'note_3',
      title: 'Monthly Goals',
      createdAt: '2023-04-04T08:00:00.000Z',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut id dui mi. Fusce varius ...',
      tags: [
        { id: 'tag_profit', label: 'Profitable', tone: 'amber' },
        { id: 'tag_person2', label: 'Person', tone: 'slate' },
        { id: 'tag_ai3', label: 'AI', tone: 'emerald' },
      ],
    },
  ],
  _meta: { minutesToHhMm },
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialData
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return initialData
    return { ...initialData, ...parsed, _meta: { minutesToHhMm } }
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
    case 'ui/setViewMode': {
      return { ...state, ui: { ...state.ui, viewMode: action.viewMode } }
    }
    case 'task/add': {
      const { projectId, status, title } = action
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
    return {
      state,
      dispatch,
      derived: { tasks, task, minutesToHhMm },
    }
  }, [state])

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>
}

