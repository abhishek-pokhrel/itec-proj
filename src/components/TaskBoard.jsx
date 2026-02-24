import React, { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, List, Plus, Table2 } from 'lucide-react'
import { useApp } from '../state/useApp'
import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

const columns = [
  { id: 'open', title: 'Open', dot: 'bg-slate-400' },
  { id: 'in_progress', title: 'In Progress', dot: 'bg-indigo-500' },
  { id: 'done', title: 'Done', dot: 'bg-emerald-500' },
]

function TaskCard({ task, active, onSelect, onMove }) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'group w-full rounded-2xl border p-3 text-left transition',
        active
          ? 'border-indigo-200 bg-indigo-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold text-slate-900">{task.title}</div>
          <div className="mt-0.5 truncate text-xs font-semibold text-slate-400">{task.headline}</div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-black uppercase text-slate-700">
          {(task.assignee?.avatarText ?? task.assignee?.name ?? 'u').slice(0, 2)}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {(task.tags ?? []).slice(0, 3).map((tag) => (
          <Badge key={tag.id} tone={tag.tone}>
            {tag.label}
          </Badge>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {new Date(task.deadlineAt).toLocaleDateString()}
        </span>
        <div className="hidden items-center gap-1 group-hover:flex">
          <Button size="sm" variant="ghost" onClick={(e) => (e.preventDefault(), onMove('open'))}>
            Open
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => (e.preventDefault(), onMove('in_progress'))}>
            In progress
          </Button>
          <Button size="sm" variant="ghost" onClick={(e) => (e.preventDefault(), onMove('done'))}>
            Done
          </Button>
        </div>
        <div className="flex items-center gap-1 text-slate-400 group-hover:hidden">
          {task.status === 'done' ? <CheckCircle2 className="h-4 w-4" /> : null}
        </div>
      </div>
    </button>
  )
}

function Tabs({ value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
          value === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
        )}
        onClick={() => onChange('calendar')}
      >
        <Table2 className="h-4 w-4" />
        Calendar
      </button>
      <button
        className={cn(
          'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
          value === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
        )}
        onClick={() => onChange('list')}
      >
        <List className="h-4 w-4" />
        List
      </button>
    </div>
  )
}

function ListView({ tasks, onSelect, selectedTaskId }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="grid grid-cols-[110px_1fr_110px_140px] gap-0 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-slate-400">
        <div>Status</div>
        <div>Task</div>
        <div>Priority</div>
        <div>Deadline</div>
      </div>
      <div className="divide-y divide-slate-100">
        {tasks.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              'grid w-full grid-cols-[110px_1fr_110px_140px] items-center gap-0 px-4 py-3 text-left transition hover:bg-slate-50',
              selectedTaskId === t.id ? 'bg-indigo-50' : '',
            )}
          >
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
              {t.status.replace('_', ' ')}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-extrabold text-slate-900">{t.title}</div>
              <div className="truncate text-xs font-semibold text-slate-400">{t.headline}</div>
            </div>
            <div>
              <Badge tone={t.priority === 'very_high' ? 'rose' : t.priority === 'high' ? 'amber' : 'slate'}>
                {t.priority.replace('_', ' ')}
              </Badge>
            </div>
            <div className="text-sm font-semibold text-slate-600">
              {t.deadlineAt ? new Date(t.deadlineAt).toLocaleDateString() : '—'}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function TaskBoard({ tasks, viewMode, onViewModeChange }) {
  const { state, dispatch } = useApp()
  const [draftByCol, setDraftByCol] = useState({ open: '', in_progress: '', done: '' })

  const byStatus = useMemo(() => {
    const map = { open: [], in_progress: [], done: [] }
    for (const t of tasks) map[t.status]?.push(t)
    return map
  }, [tasks])

  const projectId = state.ui.selectedProjectId

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-extrabold text-slate-900">Tasks</div>
          <div className="text-xs font-semibold text-slate-400">{tasks.length} items</div>
        </div>
        <Tabs value={viewMode} onChange={onViewModeChange} />
      </div>

      <div className="mt-4">
        {viewMode === 'list' ? (
          <ListView
            tasks={tasks}
            selectedTaskId={state.ui.selectedTaskId}
            onSelect={(id) => dispatch({ type: 'ui/selectTask', taskId: id })}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.id} className="min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2 w-2 rounded-full', col.dot)} />
                    <div className="text-sm font-extrabold text-slate-800">{col.title}</div>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                      {byStatus[col.id].length}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Input
                    value={draftByCol[col.id] ?? ''}
                    onChange={(e) => setDraftByCol((d) => ({ ...d, [col.id]: e.target.value }))}
                    placeholder="Add a task…"
                    className="h-9 rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const title = (draftByCol[col.id] ?? '').trim()
                        dispatch({ type: 'task/add', projectId, status: col.id, title })
                        setDraftByCol((d) => ({ ...d, [col.id]: '' }))
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="primary"
                    title="Add"
                    onClick={() => {
                      const title = (draftByCol[col.id] ?? '').trim()
                      dispatch({ type: 'task/add', projectId, status: col.id, title })
                      setDraftByCol((d) => ({ ...d, [col.id]: '' }))
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 space-y-3">
                  {byStatus[col.id].map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      active={t.id === state.ui.selectedTaskId}
                      onSelect={() => dispatch({ type: 'ui/selectTask', taskId: t.id })}
                      onMove={(status) => dispatch({ type: 'task/moveStatus', projectId, taskId: t.id, status })}
                    />
                  ))}

                  {byStatus[col.id].length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-400">
                      No tasks here yet.
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

