import React, { useMemo } from 'react'
import {
  Activity,
  BarChart3,
  Calendar,
  Folder,
  LayoutGrid,
  Plus,
  Search,
  Settings,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../state/useApp'
import { cn } from '../lib/cn'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

function NavItem({ active, icon: Icon, children }) {
  const IconComp = Icon
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold',
        active ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
      )}
    >
      <IconComp className={cn('h-4 w-4', active ? 'text-white' : 'text-slate-400')} />
      <span className="truncate">{children}</span>
    </div>
  )
}

function Avatar({ text = 'u' }) {
  return (
    <div className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold uppercase text-slate-700">
      {text.slice(0, 2)}
    </div>
  )
}

export function Sidebar({ query, setQuery }) {
  const { state, dispatch, derived } = useApp()

  const selectedProject = useMemo(
    () => state.projects.find((p) => p.id === state.ui.selectedProjectId) ?? state.projects[0],
    [state.projects, state.ui.selectedProjectId],
  )

  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-500 text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-sm font-extrabold text-slate-900">Task</div>
        </div>
        <Button
          size="icon"
          variant="soft"
          title="New task"
          onClick={() =>
            dispatch({ type: 'task/add', projectId: selectedProject.id, status: 'open', title: 'New task' })
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="space-y-1">
        <NavItem icon={LayoutGrid} active={state.ui.activeNav === 'overview'}>
          Overview
        </NavItem>
        <NavItem icon={Calendar} active={state.ui.activeNav === 'calendar'}>
          Calendar
        </NavItem>
        <NavItem icon={BarChart3} active={state.ui.activeNav === 'analytics'}>
          Analytics
        </NavItem>
        <NavItem icon={Activity} active={state.ui.activeNav === 'activity'}>
          Activity
        </NavItem>
        <NavItem icon={Folder} active>
          Projects
        </NavItem>
      </div>

      <div className="mt-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Projects</div>
          <Button size="icon" variant="ghost" title="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-1">
          {state.projects.map((p) => {
            const active = p.id === state.ui.selectedProjectId
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
                      'grid h-7 w-7 place-items-center rounded-full text-xs font-black text-white shadow-sm',
                      p.id === 'proj_1' ? 'bg-amber-500' : p.id === 'proj_2' ? 'bg-slate-900' : 'bg-indigo-600',
                    )}
                  >
                    {p.name.replace('Proj', '').trim() || '•'}
                  </span>
                  <span className="truncate">{p.name}</span>
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {p.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-1 min-h-0 flex-1">
        <div className="mb-2 flex items-center justify-between px-1">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Tasks</div>
          <span className="text-xs text-slate-400">{derived.tasks.length}</span>
        </div>
        <div className="max-h-full overflow-auto pr-1">
          <div className="space-y-1">
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
                    <div className="truncate text-xs text-slate-400">{t.headline}</div>
                  </div>
                  <span
                    className={cn(
                      'mt-0.5 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      t.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : t.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600',
                    )}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Avatar text="kz" />
          <div className="min-w-0">
            <div className="truncate text-sm font-extrabold text-slate-900">Kazu</div>
            <div className="truncate text-xs font-semibold text-emerald-600">Free Account</div>
          </div>
        </div>
        <Button size="sm" variant="primary">
          Upgrade
        </Button>
      </div>
    </aside>
  )
}

