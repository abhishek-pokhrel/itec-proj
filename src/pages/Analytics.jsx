import React, { useMemo } from 'react'
import { TrendingUp, BarChart3, PieChart, ActivitySquare } from 'lucide-react'
import { useApp } from '../state/useApp'
import { Card } from '../ui/Card'

export default function Analytics({ darkMode = false }) {
  const { state, derived } = useApp()
  const allTasks = derived.allTasks

  const stats = useMemo(() => {
    const total = allTasks.length
    const done = allTasks.filter((t) => t.status === 'done').length
    const open = allTasks.filter((t) => t.status === 'open' || t.status === 'todo').length
    const inProgress = allTasks.filter((t) => t.status === 'in_progress' || t.status === 'in-progress').length
    const high = allTasks.filter((t) => t.priority === 'high').length
    const medium = allTasks.filter((t) => t.priority === 'medium').length
    const low = allTasks.filter((t) => t.priority === 'low').length

    return {
      total,
      done,
      open,
      inProgress,
      completionRate: total > 0 ? Math.round((done / total) * 100) : 0,
      avgCompletionRate: total > 0 ? ((done / total) * 100).toFixed(1) : 0,
      high,
      medium,
      low,
    }
  }, [allTasks])

  const projectStats = useMemo(() => {
    return state.projects.map((proj) => {
      const projTasks = allTasks.filter((t) => t.projectId === proj._id)
      const projDone = projTasks.filter((t) => t.status === 'done').length
      const projInProgress = projTasks.filter((t) => t.status === 'in_progress' || t.status === 'in-progress').length
      return {
        ...proj,
        total: projTasks.length,
        done: projDone,
        inProgress: projInProgress,
        completionRate: projTasks.length > 0 ? Math.round((projDone / projTasks.length) * 100) : 0,
      }
    })
  }, [state.projects, allTasks])

  const priorityStats = useMemo(() => {
    return {
      high: {
        total: stats.high,
        done: allTasks.filter((t) => t.priority === 'high' && t.status === 'done').length,
      },
      medium: {
        total: stats.medium,
        done: allTasks.filter((t) => t.priority === 'medium' && t.status === 'done').length,
      },
      low: {
        total: stats.low,
        done: allTasks.filter((t) => t.priority === 'low' && t.status === 'done').length,
      },
    }
  }, [allTasks, stats])

  const taskTrend = useMemo(() => {
    const last7Days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const tasksCreated = allTasks.filter((t) => {
        const createdAt = new Date(t.createdAt)
        return createdAt >= dayStart && createdAt <= dayEnd
      }).length

      const tasksCompleted = allTasks.filter((t) => {
        const completedAt = new Date(t.updatedAt)
        return t.status === 'done' && completedAt >= dayStart && completedAt <= dayEnd
      }).length

      last7Days.push({
        date: dateStr,
        created: tasksCreated,
        completed: tasksCompleted,
      })
    }
    return last7Days
  }, [allTasks])

  return (
    <div className={`space-y-6 overflow-y-auto p-6 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div>
        <h1 className={`text-3xl font-extrabold flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <BarChart3 className="h-8 w-8" />
          Analytics
        </h1>
        <p className={`text-sm font-semibold mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
          Detailed insights into your tasks and projects
        </p>
      </div>

      {/* Overall metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Total Tasks
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            {stats.total}
          </div>
        </Card>

        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Completed
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
            {stats.done}
          </div>
        </Card>

        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Completion Rate
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
            {stats.completionRate}%
          </div>
        </Card>

        <Card className={`p-4 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className={`text-sm font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            In Progress
          </div>
          <div className={`mt-2 text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
            {stats.inProgress}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Task Status Distribution */}
        <Card className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <PieChart className="h-5 w-5" />
            Task Status Distribution
          </h3>
          <div className="space-y-4">
            {[
              { label: 'Open', value: stats.open, color: 'bg-slate-500', darkColor: 'from-slate-500 to-slate-600' },
              { label: 'In Progress', value: stats.inProgress, color: 'bg-indigo-500', darkColor: 'from-indigo-500 to-indigo-600' },
              { label: 'Completed', value: stats.done, color: 'bg-emerald-500', darkColor: 'from-emerald-500 to-emerald-600' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    {item.value} ({stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%)
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full ${darkMode ? `bg-gradient-to-r ${item.darkColor}` : item.color}`}
                    style={{
                      width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Priority Breakdown */}
        <Card className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <ActivitySquare className="h-5 w-5" />
            Priority Breakdown
          </h3>
          <div className="space-y-4">
            {[
              {
                label: 'High',
                total: priorityStats.high.total,
                done: priorityStats.high.done,
                color: 'rose',
                darkColor: 'from-rose-500 to-rose-600',
              },
              {
                label: 'Medium',
                total: priorityStats.medium.total,
                done: priorityStats.medium.done,
                color: 'amber',
                darkColor: 'from-amber-500 to-amber-600',
              },
              {
                label: 'Low',
                total: priorityStats.low.total,
                done: priorityStats.low.done,
                color: 'cyan',
                darkColor: 'from-cyan-500 to-cyan-600',
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.label}
                  </span>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.done}/{item.total} done
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full ${darkMode ? `bg-gradient-to-r ${item.darkColor}` : `bg-${item.color}-500`}`}
                    style={{
                      width: `${item.total > 0 ? (item.done / item.total) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Project Performance */}
      <Card className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <TrendingUp className="h-5 w-5" />
          Project Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <th className={`text-left py-3 px-4 font-semibold ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Project
                </th>
                <th className={`text-center py-3 px-4 font-semibold ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Total
                </th>
                <th className={`text-center py-3 px-4 font-semibold ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Done
                </th>
                <th className={`text-center py-3 px-4 font-semibold ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  In Progress
                </th>
                <th className={`text-right py-3 px-4 font-semibold ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Completion
                </th>
              </tr>
            </thead>
            <tbody>
              {projectStats.map((project) => (
                <tr key={project._id} className={`border-b ${darkMode ? 'border-slate-700/50' : 'border-slate-100'}`}>
                  <td className={`py-4 px-4 font-semibold ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                    {project.name}
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {project.total}
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    <span className="font-semibold">{project.done}</span>
                  </td>
                  <td className={`text-center py-4 px-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    <span className="font-semibold">{project.inProgress}</span>
                  </td>
                  <td className="text-right py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`h-2 w-20 rounded-full overflow-hidden ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full ${darkMode ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-indigo-500'}`}
                          style={{ width: `${project.completionRate}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-bold w-12 text-right ${
                        darkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {project.completionRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 7-Day Trend */}
      <Card className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-slate-900'
        }`}>
          <TrendingUp className="h-5 w-5" />
          7-Day Activity Trend
        </h3>
        <div className="overflow-x-auto">
          <div className="flex items-end gap-2 min-w-full px-2 py-4" style={{ height: '200px' }}>
            {taskTrend.map((day, idx) => {
              const maxValue = Math.max(...taskTrend.map((d) => Math.max(d.created, d.completed)), 1)
              const createdHeight = (day.created / maxValue) * 100
              const completedHeight = (day.completed / maxValue) * 100

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end gap-2">
                  <div className="flex gap-1 h-full items-end">
                    <div
                      className={`flex-1 rounded-t transition-all ${
                        darkMode ? 'bg-gradient-to-t from-blue-500 to-blue-400' : 'bg-blue-500'
                      }`}
                      style={{
                        height: `${createdHeight}%`,
                        minHeight: day.created > 0 ? '4px' : '0px',
                      }}
                      title={`Created: ${day.created}`}
                    ></div>
                    <div
                      className={`flex-1 rounded-t transition-all ${
                        darkMode ? 'bg-gradient-to-t from-emerald-500 to-emerald-400' : 'bg-emerald-500'
                      }`}
                      style={{
                        height: `${completedHeight}%`,
                        minHeight: day.completed > 0 ? '4px' : '0px',
                      }}
                      title={`Completed: ${day.completed}`}
                    ></div>
                  </div>
                  <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {day.date}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${darkMode ? 'bg-blue-500' : 'bg-blue-500'}`}></div>
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Created</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded ${darkMode ? 'bg-emerald-500' : 'bg-emerald-500'}`}></div>
            <span className={darkMode ? 'text-slate-400' : 'text-slate-600'}>Completed</span>
          </div>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Quick Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Total Projects
              </span>
              <span className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                {state.projects.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Average Project Completion
              </span>
              <span className={`font-bold text-lg ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {projectStats.length > 0
                  ? Math.round(projectStats.reduce((sum, p) => sum + p.completionRate, 0) / projectStats.length)
                  : 0}
                %
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Tasks Per Project
              </span>
              <span className={`font-bold text-lg ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                {state.projects.length > 0
                  ? Math.round(stats.total / state.projects.length)
                  : 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className={`p-6 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Open Tasks
              </span>
              <span className={`font-bold text-lg ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {stats.open}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                In Progress
              </span>
              <span className={`font-bold text-lg ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {stats.inProgress}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Completed Tasks
              </span>
              <span className={`font-bold text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {stats.done}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
