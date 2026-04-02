import React, { useMemo, useState } from 'react'
import { Calendar, ChevronDown, Folder, LayoutGrid, Plus, Settings, LogOut } from 'lucide-react'
import { useApp } from '../state/useApp'
import { cn } from '../lib/cn'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useNavigate } from 'react-router-dom'
import API from '../lib/api'

function NavItem({ active, icon: Icon, children, onClick }) {
  const IconComp = Icon
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition duration-200',
        active ? 'bg-gradient-to-r from-blue-900 to-slate-800 text-white shadow-md hover:shadow-lg' : 'text-slate-500 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-100 hover:text-slate-800',
      )}
    >
      <IconComp className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')} />
      <span className="truncate">{children}</span>
    </button>
  )
}

function Avatar({ text = 'u' }) {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-full border border-slate-300 bg-gradient-to-br from-blue-100 to-blue-200 text-xs font-bold uppercase text-blue-900 shadow-sm">
      {text.slice(0, 2)}
    </div>
  )
}

export function Sidebar() {
  const { state, dispatch, derived } = useApp()
  const [projectName, setProjectName] = useState('')
  const navigate = useNavigate()

  const selectedProject = useMemo(
    () => state.projects.find((p) => p.id === state.ui.selectedProjectId) ?? state.projects[0],
    [state.projects, state.ui.selectedProjectId],
  )

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <aside className="flex min-h-0 flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-gradient-to-b from-white via-slate-50 to-slate-100 p-4 shadow-soft">
      <div className="text-3xl font-medium bg-gradient-to-r from-slate-900 via-slate-900 to-blue-900 bg-clip-text text-transparent">Title</div>

      {/* Overview Section - Prominent */}
      <div className="rounded-xl border-2 border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-3">
        <button
          onClick={() => dispatch({ type: 'ui/setNav', nav: 'overview' })}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition duration-200',
            state.ui.activeNav === 'overview'
              ? 'bg-gradient-to-r from-blue-900 to-slate-800 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/80',
          )}
        >
          <LayoutGrid className={cn('h-5 w-5', state.ui.activeNav === 'overview' ? 'text-white' : 'text-blue-600')} />
          <span>Overview</span>
        </button>
      </div>

      <div className="space-y-1 border-b border-slate-100 pb-3">
        <NavItem icon={Calendar} active={state.ui.activeNav === 'calendar'} onClick={() => dispatch({ type: 'ui/setNav', nav: 'calendar' })}>
          Calendar
        </NavItem>
      </div>

      <div className="mt-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Projects</div>
          <Button size="icon" variant="ghost" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-2 flex items-center gap-2">
          <Input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Add project..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const name = projectName.trim()
                if (name) {
                  API.post('/projects', { name }).then(res => {
                    dispatch({ type: 'project/add', project: res.data })
                    setProjectName('')
                  }).catch(err => console.error('Failed to add project', err))
                }
              }
            }}
          />
          <Button
            size="icon"
            variant="primary"
            title="Add project"
            onClick={() => {
              const name = projectName.trim()
              dispatch({ type: 'project/add', name })
              setProjectName('')
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          {state.projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-400">
              No projects yet.
            </div>
          ) : null}
          {state.projects.map((p, index) => {
            const active = p.id === state.ui.selectedProjectId
            const colorClass = ['bg-amber-500', 'bg-slate-900', 'bg-indigo-600', 'bg-emerald-500', 'bg-rose-500'][index % 5]
            return (
              <button
                key={p.id}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition',
                  active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
                onClick={() => dispatch({ type: 'ui/selectProject', projectId: p.id })}
              >
                <span className="flex min-w-0 items-center gap-2 truncate">
                  <span
                    className={cn(
                      'grid h-7 w-7 place-items-center rounded-full text-xs font-black text-white shadow-sm ring-2 ring-white',
                      colorClass,
                    )}
                  >
                    {p.name.replace('Proj', '').trim() || '•'}
                  </span>
                  <span className="truncate">{p.name}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-1 min-h-0 flex-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Tasks</div>
          <Button
            size="icon"
            variant="ghost"
            title="Add task"
            className="h-6 w-6"
            onClick={() =>
              selectedProject
                ? dispatch({ type: 'task/add', projectId: selectedProject.id, status: 'open', title: 'New task' })
                : null
            }
            disabled={!selectedProject}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="max-h-full overflow-auto pr-1">
          <div className="space-y-1">
            {derived.tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm font-semibold text-slate-400">
                No tasks yet.
              </div>
            ) : null}

            {derived.tasks.map((t) => {
              const active = t.id === state.ui.selectedTaskId
              return (
                <button
                  key={t.id}
                  className={cn(
                    'flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2 text-left transition',
                    active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  )}
                  onClick={() => dispatch({ type: 'ui/selectTask', taskId: t.id })}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{t.title}</div>
                    <div className="truncate text-xs text-slate-400">{t.status.replace('_', ' ')}</div>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-400">
                    {(t.tags ?? []).length}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50 p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar text="kz" />
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold text-slate-900">Kazu</div>
            <div className="truncate text-xs font-semibold text-emerald-600">Free Account</div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8" title="Logout" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}

