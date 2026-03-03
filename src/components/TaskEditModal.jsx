import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../state/useApp'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { cn } from '../lib/cn'

const PRIORITIES = ['small', 'medium', 'high', 'very_high']
const TAG_TONES = ['slate', 'violet', 'emerald', 'cyan', 'amber', 'blue', 'pink', 'rose']

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`
}

export function TaskEditModal({ taskId, projectId, onClose }) {
  const { state, dispatch } = useApp()
  const task = (state.tasksByProject[projectId] ?? []).find((t) => t.id === taskId)

  const [title, setTitle] = useState('')
  const [headline, setHeadline] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('small')
  const [deadlineAt, setDeadlineAt] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])

  // Sync form state from task
  useEffect(() => {
    if (task) {
      setTitle(task.title ?? '')
      setHeadline(task.headline ?? '')
      setDescription(task.description ?? '')
      setPriority(task.priority ?? 'small')
      setDeadlineAt(task.deadlineAt ? task.deadlineAt.slice(0, 16) : '')
      setAssigneeName(task.assignee?.name ?? '')
      setTags(task.tags ?? [])
    }
  }, [task])

  if (!task) return null

  function handleSave() {
    dispatch({
      type: 'task/update',
      projectId,
      taskId: task.id,
      patch: {
        title: title.trim() || 'Untitled',
        headline: headline.trim(),
        description: description.trim(),
        priority,
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : task.deadlineAt,
        assignee: { name: assigneeName.trim() || 'user', avatarText: (assigneeName.trim() || 'u').slice(0, 2) },
        tags,
      },
    })
    onClose()
  }

  function addTag() {
    const label = tagInput.trim()
    if (!label) return
    const tone = TAG_TONES[tags.length % TAG_TONES.length]
    setTags([...tags, { id: uid('tag'), label, tone }])
    setTagInput('')
  }

  function removeTag(id) {
    setTags(tags.filter((t) => t.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-lg font-extrabold text-slate-900">Edit Task</div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Headline</label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Short headline" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this task…" className="min-h-20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Priority</label>
              <div className="flex flex-wrap gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={cn(
                      'rounded-lg border px-2.5 py-1 text-xs font-semibold capitalize transition',
                      priority === p
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    {p.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Assignee</label>
              <Input value={assigneeName} onChange={(e) => setAssigneeName(e.target.value)} placeholder="Name" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Deadline</label>
            <input
              type="datetime-local"
              value={deadlineAt}
              onChange={(e) => setDeadlineAt(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-extrabold uppercase tracking-wide text-slate-500">Tags</label>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span key={tag.id} className="inline-flex items-center gap-1">
                  <Badge tone={tag.tone}>{tag.label}</Badge>
                  <button onClick={() => removeTag(tag.id)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag..."
                className="h-9"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
              />
              <Button size="sm" variant="soft" onClick={addTag}>Add</Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
