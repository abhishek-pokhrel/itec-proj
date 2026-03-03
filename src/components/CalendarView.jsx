import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../state/useApp'
import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getMonthData(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const cells = []

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, date: new Date(year, month - 1, daysInPrevMonth - i) })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(year, month, d) })
  }

  // Next month leading days to fill 6 rows
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: new Date(year, month + 1, d) })
  }

  return cells
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function CalendarView() {
  const { state, dispatch, derived } = useApp()
  const allTasks = derived.allTasks
  const today = new Date()

  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const cells = useMemo(() => getMonthData(year, month), [year, month])

  // Index tasks by date key for fast lookup
  const tasksByDate = useMemo(() => {
    const map = {}
    for (const t of allTasks) {
      if (!t.deadlineAt) continue
      const d = new Date(t.deadlineAt)
      const key = toDateKey(d)
      if (!map[key]) map[key] = []
      map[key].push(t)
    }
    return map
  }, [allTasks])

  const monthLabel = viewDate.toLocaleString(undefined, { month: 'long', year: 'numeric' })

  const goPrev = () => setViewDate(new Date(year, month - 1, 1))
  const goNext = () => setViewDate(new Date(year, month + 1, 1))
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), 1))

  return (
    <Card className="flex flex-col overflow-hidden p-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <div className="text-lg font-extrabold text-slate-900">{monthLabel}</div>
          <div className="text-xs font-semibold text-slate-400">Task deadlines across all projects</div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={goToday}>Today</Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={goPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={goNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {DAYS.map((d) => (
          <div key={d} className="px-1 pb-2 text-center text-xs font-extrabold uppercase tracking-wide text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid flex-1 grid-cols-7">
        {cells.map((cell, idx) => {
          const key = toDateKey(cell.date)
          const tasks = tasksByDate[key] ?? []
          const isToday = isSameDay(cell.date, today)

          return (
            <div
              key={idx}
              className={cn(
                'min-h-[80px] border-b border-r border-slate-100 p-1',
                !cell.currentMonth && 'bg-slate-50/50',
                idx % 7 === 0 && 'border-l-0',
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    isToday ? 'bg-indigo-600 text-white' : cell.currentMonth ? 'text-slate-700' : 'text-slate-400',
                  )}
                >
                  {cell.day}
                </span>
                {tasks.length > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                )}
              </div>
              <div className="mt-0.5 space-y-0.5 overflow-hidden">
                {tasks.slice(0, 2).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      // Find which project this task belongs to
                      const projId = Object.entries(state.tasksByProject).find(([, list]) =>
                        list.some((tk) => tk.id === t.id),
                      )?.[0]
                      if (projId) {
                        dispatch({ type: 'ui/selectProject', projectId: projId })
                        dispatch({ type: 'ui/selectTask', taskId: t.id })
                        dispatch({ type: 'ui/setNav', nav: 'projects' })
                      }
                    }}
                    className={cn(
                      'w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-semibold transition hover:opacity-80',
                      t.status === 'done'
                        ? 'bg-emerald-100 text-emerald-700'
                        : t.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-800',
                    )}
                  >
                    {t.title}
                  </button>
                ))}
                {tasks.length > 2 && (
                  <div className="truncate px-1 text-[10px] font-semibold text-slate-400">
                    +{tasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-amber-400" /> Open
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> In Progress
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Done
        </div>
      </div>
    </Card>
  )
}
