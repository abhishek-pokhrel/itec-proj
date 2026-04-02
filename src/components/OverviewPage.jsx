import React, { useMemo } from 'react'
import { CheckCircle2, Clock3, Folder, ListTodo, AlertCircle, TrendingUp, Zap } from 'lucide-react'
import { useApp } from '../state/useApp'
import { cn } from '../lib/cn'
import { Badge } from '../ui/Badge'
import { Card } from '../ui/Card'
import API from '../lib/api'

function StatCard({ icon: Icon, label, value, color, darkMode }) {
  return (
    <Card className={`flex items-center gap-3 p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
      <div className={cn('grid h-10 w-10 place-items-center rounded-xl', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className={`text-2xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div>
        <div className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
      </div>
    </Card>
  )
}

export function OverviewPage({ darkMode = false }) {
  const { state, dispatch, derived } = useApp()
  const allTasks = derived.allTasks

  const stats = useMemo(() => {
    const open = allTasks.filter((t) => t.status === 'open' || t.status === 'todo').length
    const inProgress = allTasks.filter((t) => t.status === 'in_progress' || t.status === 'in-progress').length
    const done = allTasks.filter((t) => t.status === 'done').length
    const high = allTasks.filter((t) => t.priority === 'high').length
    const medium = allTasks.filter((t) => t.priority === 'medium').length
    const low = allTasks.filter((t) => t.priority === 'low').length
    return { total: allTasks.length, open, inProgress, done, high, medium, low }
  }, [allTasks])

  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    return [...allTasks]
      .filter((t) => (t.deadlineAt || t.dueDate) && t.status !== 'done')
      .sort((a, b) => new Date(a.deadlineAt || a.dueDate) - new Date(b.deadlineAt || b.dueDate))
      .slice(0, 8)
  }, [allTasks])

  const overdueTasks = useMemo(() => {
    const now = new Date()
    return allTasks.filter(
      (t) => (t.deadlineAt || t.dueDate) && t.status !== 'done' && new Date(t.deadlineAt || t.dueDate) < now
    )
  }, [allTasks])

  const urgentTasks = useMemo(() => {
    const now = new Date()
    const next3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    return allTasks.filter(
      (t) =>
        (t.deadlineAt || t.dueDate) &&
        t.status !== 'done' &&
        new Date(t.deadlineAt || t.dueDate) >= now &&
        new Date(t.deadlineAt || t.dueDate) <= next3Days
    )
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
    <div className={`space-y-6 overflow-y-auto p-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div>
        <h1 className={`text-3xl font-extrabold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Overview</h1>
        <p className={`text-sm font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Summary of all your projects and tasks
        </p>
      </div>

      {/* Alert for overdue tasks */}
      {overdueTasks.length > 0 && (
        <div className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
          darkMode
            ? 'bg-red-900/20 border-red-600 text-red-300'
            : 'bg-red-50 border-red-500 text-red-700'
        }`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">⚠️ You have {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}</p>
            <p className="text-xs mt-1 opacity-80">Tasks past their due date need immediate attention</p>
          </div>
        </div>
      )}

      {/* Alert for urgent tasks */}
      {urgentTasks.length > 0 && (
        <div className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${
          darkMode
            ? 'bg-amber-900/20 border-amber-600 text-amber-300'
            : 'bg-amber-50 border-amber-500 text-amber-700'
        }`}>
          <Zap className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">⚡ {urgentTasks.length} task{urgentTasks.length !== 1 ? 's' : ''} due in the next 3 days</p>
            <p className="text-xs mt-1 opacity-80">Stay on top of approaching deadlines</p>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          icon={Folder}
          label="Projects"
          value={state.projects.length}
          color="bg-indigo-600"
          darkMode={darkMode}
        />
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={stats.total}
          color="bg-slate-700"
          darkMode={darkMode}
        />
        <StatCard
          icon={Clock3}
          label="In Progress"
          value={stats.inProgress}
          color="bg-blue-500"
          darkMode={darkMode}
        />
        <StatCard
          icon={CheckCircle2}
          label="Done"
          value={stats.done}
          color="bg-emerald-500"
          darkMode={darkMode}
        />
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`mb-2 text-sm font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Overall Completion
          </div>
          <div className={`flex h-3 overflow-hidden rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
            <div
              className="rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(stats.done / stats.total) * 100}%` }}
            />
          </div>
          <div className={`mt-2 flex items-center justify-between text-xs font-semibold ${
            darkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <span>
              {stats.done} of {stats.total} tasks completed
            </span>
            <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
              {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
            </span>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* Priority breakdown */}
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`mb-4 text-sm font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            By Priority
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  High
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>{stats.high}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Medium
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>{stats.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Low
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.low}</span>
            </div>
          </div>
        </Card>

        {/* Status breakdown */}
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`mb-4 text-sm font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            By Status
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-400"></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Open
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{stats.open}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  In Progress
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Done
                </span>
              </div>
              <span className={`font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.done}</span>
            </div>
          </div>
        </Card>

        {/* Project count */}
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`mb-4 text-sm font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            Projects
          </div>
          <div className="space-y-3">
            {state.projects.slice(0, 3).map((proj) => {
              const projTasks = allTasks.filter((t) => t.projectId === proj._id)
              const projDone = projTasks.filter((t) => t.status === 'done').length
              return (
                <div key={proj._id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold truncate ${
                      darkMode ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {proj.name}
                    </span>
                    <span className={`text-xs font-bold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {projDone}/{projTasks.length}
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${projTasks.length > 0 ? (projDone / projTasks.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
            {state.projects.length > 3 && (
              <p className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                +{state.projects.length - 3} more projects
              </p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming deadlines */}
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`mb-4 text-sm font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            📅 Upcoming Deadlines
          </div>
          {upcomingDeadlines.length === 0 ? (
            <div className={`rounded-lg border-2 border-dashed px-4 py-6 text-center ${
              darkMode
                ? 'border-slate-600 bg-slate-700/30 text-slate-400'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}>
              <p className="text-xs font-semibold">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingDeadlines.map((task) => {
                const dueDate = new Date(task.deadlineAt || task.dueDate)
                const now = new Date()
                const daysLeft = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
                const isOverdue = daysLeft < 0
                const isUrgent = daysLeft >= 0 && daysLeft <= 3

                return (
                  <div
                    key={task._id}
                    className={`p-3 rounded-lg border-l-4 ${
                      isOverdue
                        ? darkMode
                          ? 'bg-red-900/20 border-red-600'
                          : 'bg-red-50 border-red-500'
                        : isUrgent
                        ? darkMode
                          ? 'bg-amber-900/20 border-amber-600'
                          : 'bg-amber-50 border-amber-500'
                        : darkMode
                        ? 'bg-slate-700/30 border-slate-600'
                        : 'bg-slate-100 border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          darkMode ? 'text-slate-200' : 'text-slate-900'
                        }`}>
                          {task.title}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isOverdue
                            ? darkMode ? 'text-red-300' : 'text-red-600'
                            : isUrgent
                            ? darkMode ? 'text-amber-300' : 'text-amber-600'
                            : darkMode ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {isOverdue
                            ? `Overdue ${Math.abs(daysLeft)} days`
                            : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`}
                        </p>
                      </div>
                      <Badge
                        className={`flex-shrink-0 ${
                          task.priority === 'high'
                            ? 'bg-rose-500/20 text-rose-600'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/20 text-amber-600'
                            : 'bg-cyan-500/20 text-cyan-600'
                        }`}
                      >
                        {task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1)}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Recent activity */}
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`mb-4 text-sm font-extrabold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            📊 Quick Stats
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)'
            }}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Completion Rate
              </span>
              <span className={`text-lg font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)'
            }}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Tasks in Progress
              </span>
              <span className={`text-lg font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {stats.inProgress}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)'
            }}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                High Priority
              </span>
              <span className={`text-lg font-bold ${darkMode ? 'text-rose-400' : 'text-rose-600'}`}>
                {stats.high}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg" style={{
              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)'
            }}>
              <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Overdue Tasks
              </span>
              <span className={`text-lg font-bold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                {overdueTasks.length}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
