import React, { useMemo } from 'react'
import { CheckCircle2, Clock3, Folder, ListTodo } from 'lucide-react'
import { useApp } from '../state/useApp'
import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className={cn('grid h-10 w-10 place-items-center rounded-xl', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="text-2xl font-extrabold text-slate-900">{value}</div>
        <div className="text-xs font-semibold text-slate-500">{label}</div>
      </div>
    </Card>
  )
}

export function OverviewPage() {
  const { state, dispatch, derived } = useApp()
  const allTasks = derived.allTasks

  const stats = useMemo(() => {
    const open = allTasks.filter((t) => t.status === 'open').length
    const inProgress = allTasks.filter((t) => t.status === 'in_progress').length
    const done = allTasks.filter((t) => t.status === 'done').length
    return { total: allTasks.length, open, inProgress, done }
  }, [allTasks])

  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    return [...allTasks]
      .filter((t) => t.deadlineAt && t.status !== 'done')
      .sort((a, b) => new Date(a.deadlineAt) - new Date(b.deadlineAt))
      .slice(0, 8)
  }, [allTasks])

  const recentTasks = useMemo(() => {
    return [...allTasks]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6)
  }, [allTasks])

  function findProjectForTask(taskId) {
    for (const [projId, tasks] of Object.entries(state.tasksByProject)) {
      if (tasks.some((t) => t.id === taskId)) return state.projects.find((p) => p.id === projId)
    }
    return null
  }

  function selectTask(task) {
    const proj = findProjectForTask(task.id)
    if (proj) {
      dispatch({ type: 'ui/selectProject', projectId: proj.id })
      dispatch({ type: 'ui/selectTask', taskId: task.id })
      dispatch({ type: 'ui/setNav', nav: 'projects' })
    }
  }

  return (
    <div className="space-y-4 overflow-y-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Overview</h1>
        <p className="text-sm font-semibold text-slate-500">Summary of all your projects and tasks</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard icon={Folder} label="Projects" value={state.projects.length} color="bg-indigo-600" />
        <StatCard icon={ListTodo} label="Total Tasks" value={stats.total} color="bg-slate-700" />
        <StatCard icon={Clock3} label="In Progress" value={stats.inProgress} color="bg-blue-500" />
        <StatCard icon={CheckCircle2} label="Done" value={stats.done} color="bg-emerald-500" />
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <Card className="p-4">
          <div className="mb-2 text-sm font-extrabold text-slate-800">Completion</div>
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(stats.done / stats.total) * 100}%` }}
            />
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            {stats.done} of {stats.total} tasks completed ({stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%)
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming deadlines */}
        <Card className="p-4">
          <div className="mb-3 text-sm font-extrabold text-slate-800">Upcoming Deadlines</div>
          {upcomingDeadlines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-400">
              No upcoming deadlines
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((t) => {
                const proj = findProjectForTask(t.id)
                const isOverdue = new Date(t.deadlineAt) < new Date()
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTask(t)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">{t.title}</div>
                      <div className="truncate text-xs text-slate-400">{proj?.name ?? 'Unknown'}</div>
                    </div>
                    <div className={cn('shrink-0 text-xs font-semibold', isOverdue ? 'text-rose-600' : 'text-slate-500')}>
                      {new Date(t.deadlineAt).toLocaleDateString()}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recently created */}
        <Card className="p-4">
          <div className="mb-3 text-sm font-extrabold text-slate-800">Recently Created</div>
          {recentTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-400">
              No tasks yet
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((t) => {
                const proj = findProjectForTask(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => selectTask(t)}
                    className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">{t.title}</div>
                      <div className="truncate text-xs text-slate-400">{proj?.name ?? 'Unknown'}</div>
                    </div>
                    <Badge
                      tone={t.status === 'done' ? 'emerald' : t.status === 'in_progress' ? 'blue' : 'slate'}
                    >
                      {t.status.replace('_', ' ')}
                    </Badge>
                  </button>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Projects list */}
      {state.projects.length > 0 && (
        <Card className="p-4">
          <div className="mb-3 text-sm font-extrabold text-slate-800">Projects</div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {state.projects.map((p, idx) => {
              const taskCount = (state.tasksByProject[p.id] ?? []).length
              const doneCount = (state.tasksByProject[p.id] ?? []).filter((t) => t.status === 'done').length
              const colorClass = ['bg-amber-500', 'bg-slate-900', 'bg-indigo-600', 'bg-emerald-500', 'bg-rose-500'][idx % 5]
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    dispatch({ type: 'ui/selectProject', projectId: p.id })
                    dispatch({ type: 'ui/setNav', nav: 'projects' })
                  }}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className={cn('grid h-8 w-8 place-items-center rounded-full text-xs font-black text-white', colorClass)}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-400">{taskCount} tasks · {doneCount} done</div>
                  </div>
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
