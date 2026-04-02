import React, { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

const LABEL_COLORS = [
  '#3B82F6', // blue-900
  '#EF4444', // red-600
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#06B6D4', // cyan-500
  '#6366F1', // indigo-500
]

export default function LabelsManager({ labels, onAddLabel, onUpdateLabel, onDeleteLabel }) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', color: LABEL_COLORS[0] })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      onUpdateLabel(editingId, formData.name, formData.color)
      setEditingId(null)
    } else {
      onAddLabel(formData.name, formData.color)
    }

    setFormData({ name: '', color: LABEL_COLORS[0] })
    setShowForm(false)
  }

  const startEdit = (label) => {
    setFormData({ name: label.name, color: label.color })
    setEditingId(label._id)
    setShowForm(true)
  }

  return (
    <div className="rounded-xl border border-slate-300 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-lg text-slate-900">Labels</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-900 to-slate-800 text-white hover:shadow-lg transition text-sm"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-3 bg-white rounded-lg border border-slate-200 space-y-3">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Label name..."
            autoFocus
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-600">Color:</span>
            <div className="flex gap-2 flex-wrap">
              {LABEL_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full border-2 transition ${
                    formData.color === color ? 'border-slate-900' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" className="flex-1">
              {editingId ? 'Update' : 'Create'}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setFormData({ name: '', color: LABEL_COLORS[0] })
              }}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {labels.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No labels yet</p>
        ) : (
          labels.map(label => (
            <div
              key={label._id}
              className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: label.color }}
                />
                <span className="text-sm font-semibold text-slate-700">{label.name}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => startEdit(label)}
                  className="p-1 hover:bg-slate-100 rounded transition"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4 text-slate-600" />
                </button>
                <button
                  onClick={() => onDeleteLabel(label._id)}
                  className="p-1 hover:bg-red-100 rounded transition"
                  title="Delete"
                >
                  <X className="h-4 w-4 text-red-600" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
