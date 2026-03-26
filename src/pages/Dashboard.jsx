import React, { useState } from 'react'
import { Sidebar } from '../components/Sidebar'
import { TaskDetails } from '../components/TaskDetails'
import { TaskBoard } from '../components/TaskBoard'
import { CalendarView } from '../components/CalendarView'
import { OverviewPage } from '../components/OverviewPage'
import { TaskEditModal } from '../components/TaskEditModal'
import { useApp } from '../state/useApp'

export default function Dashboard() {
  const { state, dispatch, derived } = useApp()
  const tasks = derived.tasks
  const activeNav = state.ui.activeNav ?? 'projects'
  const [editingTaskId, setEditingTaskId] = useState(null)

  return (
    <div className="h-full bg-gray-50">
      <div className="mx-auto h-full max-w-[1200px] px-4 py-4">
        <div className="grid h-full grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[260px_1fr]">
            <Sidebar />

            <main className="min-w-0 overflow-y-auto space-y-4">
              {activeNav === 'overview' && <OverviewPage />}

              {activeNav === 'calendar' && <CalendarView />}

              {activeNav === 'projects' && (
                <>
                  <TaskDetails task={derived.task} onEdit={() => setEditingTaskId(derived.task?.id ?? null)} />
                  <TaskBoard
                    tasks={tasks}
                    viewMode={state.ui.viewMode}
                    onViewModeChange={(mode) => dispatch({ type: 'ui/setViewMode', viewMode: mode })}
                  />
                </>
              )}
            </main>
        </div>
      </div>

      {editingTaskId && (
        <TaskEditModal
          taskId={editingTaskId}
          projectId={state.ui.selectedProjectId}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  )
}

