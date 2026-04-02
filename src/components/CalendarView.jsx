import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { TaskService } from '../lib/taskService'

export default function CalendarView({ projectId }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [tasks, setTasks] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await TaskService.getTasksByProject(projectId)
      setTasks(data)
    } catch (err) {
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700'
      case 'medium': return 'bg-amber-100 text-amber-700'
      case 'low': return 'bg-cyan-100 text-cyan-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  const getTasksForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toDateString()
    return tasks.filter(task => {
      if (!task.dueDate) return false
      return new Date(task.dueDate).toDateString() === dateStr
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const daysArray = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i)
  }

  const weeks = []
  for (let i = 0; i < daysArray.length; i += 7) {
    weeks.push(daysArray.slice(i, i + 7))
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{monthName}</h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-3">
          {dayNames.map(day => (
            <div key={day} className="text-center text-xs font-bold text-slate-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-2 mb-2">
            {week.map((day, dayIdx) => {
              const dayTasks = day ? getTasksForDate(day) : []
              const isToday = day && new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()
              const isSelected = day && selectedDate && selectedDate.toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString()

              return (
                <div
                  key={dayIdx}
                  onClick={() => day && setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                  className={`min-h-24 p-2 rounded-lg border cursor-pointer transition ${
                    day
                      ? isToday
                        ? 'border-indigo-300 bg-indigo-50'
                        : isSelected
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                      : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  {day && (
                    <>
                      <div className={`text-sm font-bold mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-900'}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task._id}
                            className={`text-xs px-2 py-0.5 rounded truncate font-semibold ${getPriorityColor(task.priority)}`}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-slate-500 px-2 font-semibold">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Selected Date Tasks */}
      {selectedDate && (
        <div className="border-t border-slate-200 p-6 bg-slate-50">
          <p className="text-sm font-bold text-slate-600 mb-3">
            Tasks for {selectedDate.toDateString()}
          </p>
          <div className="space-y-2">
            {getTasksForDate(selectedDate.getDate()).length > 0 ? (
              getTasksForDate(selectedDate.getDate()).map(task => (
                <div key={task._id} className="bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No tasks scheduled for this date</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
