import React, { useState } from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

export default function Subtasks({ task, onAddSubtask, onUpdateSubtask, onDeleteSubtask }) {
  const [newSubtask, setNewSubtask] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = () => {
    if (newSubtask.trim()) {
      onAddSubtask(task._id, newSubtask)
      setNewSubtask('')
      setIsAdding(false)
    }
  }

  const completedCount = task.subtasks?.filter(s => s.completed).length || 0
  const totalCount = task.subtasks?.length || 0

  if (totalCount === 0 && !isAdding) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      {totalCount > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600">Subtasks</p>
            <span className="text-xs font-semibold text-slate-600">{completedCount}/{totalCount}</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* Subtask List */}
      <div className="space-y-2">
        {task.subtasks?.map(subtask => (
          <div
            key={subtask.id}
            className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition"
          >
            <button
              onClick={() => onUpdateSubtask(task._id, subtask.id, { completed: !subtask.completed })}
              className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition ${
                subtask.completed
                  ? 'bg-emerald-600 border-emerald-600'
                  : 'border-slate-300 hover:border-emerald-600'
              }`}
            >
              {subtask.completed && <Check className="h-3 w-3 text-white" />}
            </button>
            <span
              className={`flex-1 text-sm ${
                subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => onDeleteSubtask(task._id, subtask.id)}
              className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition"
            >
              <Trash2 className="h-3.5 w-3.5 text-red-600" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Subtask */}
      {isAdding ? (
        <div className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="Add a subtask..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
            autoFocus
          />
          <Button onClick={handleAdd} size="sm">Add</Button>
          <button
            onClick={() => {
              setIsAdding(false)
              setNewSubtask('')
            }}
            className="px-3 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition w-full"
        >
          <Plus className="h-4 w-4" />
          Add subtask
        </button>
      )}
    </div>
  )
}
