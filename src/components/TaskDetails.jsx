import React, { useMemo } from 'react'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import { useApp } from '../state/useApp'

function fmtDate(dt) {
  if (!dt) return '—'
  try {
    const d = new Date(dt)
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return '—'
  }
}

function fmtDateTime(dt) {
  if (!dt) return '—'
  try {
    const d = new Date(dt)
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{children}</div>
    </div>
  )
}

export function TaskDetails({ task }) {
  const { state, derived } = useApp()
  const project = useMemo(
    () => state.projects.find((p) => p.id === state.ui.selectedProjectId) ?? state.projects[0],
    [state.projects, state.ui.selectedProjectId],
  )

  if (!task) {
    return (
      <Card className="p-6">
        <div className="text-sm text-white/70">No task selected.</div>
      </Card>
    )
  }

  const statusLabel = task.status.replace('_', ' ')
  const tracked = derived.minutesToHhMm(task.trackedMinutes ?? 0)

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_260px_at_30%_0%,rgba(79,70,229,0.28),transparent_70%)]" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-5">
          <div className="min-w-0">
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-600">
              Projects <span className="px-2 text-slate-400">→</span> {project?.name}
            </div>
            <div className="mt-1 truncate text-2xl font-extrabold text-slate-900">{task.title}</div>
            <div className="mt-1 truncate text-sm font-semibold text-slate-600">{task.headline}</div>
          </div>
          <div className="hidden shrink-0 items-center gap-6 rounded-2xl border border-slate-200/70 bg-white/75 px-4 py-3 backdrop-blur md:flex">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Created</div>
              <div className="text-sm font-extrabold text-slate-800">{fmtDate(task.createdAt)}</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Deadline</div>
              <div className="text-sm font-extrabold text-slate-800">{fmtDate(task.deadlineAt)}</div>
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Tracked time</div>
              <div className="text-sm font-extrabold text-slate-800">{tracked}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2">
        <Field label="Created At">{fmtDateTime(task.createdAt)}</Field>

        <Field label="Tags">
          <div className="flex flex-wrap gap-2">
            {(task.tags ?? []).map((tag) => (
              <Badge key={tag.id} tone={tag.tone}>
                {tag.label}
              </Badge>
            ))}
            {(!task.tags || task.tags.length === 0) && <span className="text-slate-400">—</span>}
          </div>
        </Field>

        <Field label="Assign">
          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-black uppercase text-slate-700">
              {(task.assignee?.avatarText ?? task.assignee?.name ?? 'u').slice(0, 2)}
            </div>
            <div className="text-sm font-extrabold text-slate-800">{task.assignee?.name ?? '—'}</div>
          </div>
        </Field>

        <Field label="Group">
          <div className="text-slate-600">
            {(task.groupPath ?? ['—']).map((p, idx) => (
              <span key={`${p}_${idx}`}>
                {p}
                {idx < (task.groupPath?.length ?? 1) - 1 ? (
                  <span className="px-2 text-slate-300">→</span>
                ) : null}
              </span>
            ))}
          </div>
        </Field>

        <Field label="Priority">
          <Badge tone={task.priority === 'very_high' ? 'rose' : task.priority === 'high' ? 'amber' : 'slate'}>
            {task.priority?.replace('_', ' ') ?? '—'}
          </Badge>
          <span className="ml-2 text-xs font-semibold text-slate-400">({statusLabel})</span>
        </Field>

        <Field label="Description">
          <div className="text-sm leading-relaxed text-slate-600">{task.description || '—'}</div>
        </Field>
      </div>
    </Card>
  )
}

