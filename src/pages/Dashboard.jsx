import React, { useMemo, useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { TaskDetails } from '../components/TaskDetails'
import { TaskBoard } from '../components/TaskBoard'
import { NotesRail } from '../components/NotesRail'
import { useApp } from '../state/useApp'

export default function Dashboard() {
  const { state, dispatch, derived } = useApp()
  const [query, setQuery] = useState('')

  const tasks = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return derived.tasks
    return derived.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.headline ?? '').toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q),
    )
  }, [derived.tasks, query])

  return (
    <div className="h-full bg-app-bg">
      <div className="mx-auto h-full max-w-[1500px] px-4 py-4">
        <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_360px]">
            <Sidebar query={query} setQuery={setQuery} />

            <main className="min-w-0 space-y-4">
              <TaskDetails task={derived.task} />
              <TaskBoard
                tasks={tasks}
                viewMode={state.ui.viewMode}
                onViewModeChange={(mode) => dispatch({ type: 'ui/setViewMode', viewMode: mode })}
              />
            </main>

            <NotesRail
              notes={state.notes}
              onAddNote={(title, excerpt) => dispatch({ type: 'note/add', title, excerpt })}
            />
        </div>
      </div>
    </div>
  )
}

