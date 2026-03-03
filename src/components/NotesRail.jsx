import React, { useState } from 'react'
import { CalendarDays, CheckSquare, MoreHorizontal, Plus, StickyNote } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input, Textarea } from '../ui/Input'

function fmtDate(dt) {
  if (!dt) return '—'
  try {
    const d = new Date(dt)
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return '—'
  }
}

export function NotesRail({ todos = [], notes = [], onAddTodo, onToggleTodo, onAddNote }) {
  const [todoDraft, setTodoDraft] = useState('')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')

  return (
    <aside className="hidden min-h-0 flex-col gap-3 overflow-hidden lg:flex">
      <Card className="min-h-0 overflow-hidden p-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <CheckSquare className="h-4 w-4 text-slate-400" /> Todos
          </div>
          <Button size="icon" variant="soft" title="New todo" className="h-8 w-8" onClick={() => {
            const title = todoDraft.trim()
            onAddTodo(title)
            setTodoDraft('')
          }}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Input
            value={todoDraft}
            onChange={(e) => setTodoDraft(e.target.value)}
            placeholder="Add todo..."
            className="h-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const todoTitle = todoDraft.trim()
                onAddTodo(todoTitle)
                setTodoDraft('')
              }
            }}
          />
        </div>

        <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
          {todos.map((todo) => (
            <div key={todo.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => onToggleTodo(todo.id)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-200"
                />
                <div className="min-w-0 flex-1">
                  <div className={todo.done ? 'truncate text-sm font-semibold text-slate-400 line-through' : 'truncate text-sm font-semibold text-slate-800'}>
                    {todo.title}
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {(todo.tags ?? []).slice(0, 2).map((tag) => (
                        <Badge key={tag.id} tone={tag.tone} className="text-[10px]">
                          {tag.label}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400">{fmtDate(todo.date)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-800">
            <StickyNote className="h-4 w-4 text-slate-400" /> Notes
          </div>
          <Button size="icon" variant="soft" title="New note" className="h-8 w-8" onClick={() => setOpen((v) => !v)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {open ? (
          <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" className="h-9" />
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a quick note…"
              className="min-h-20"
            />
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                  setTitle('')
                  setExcerpt('')
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  onAddNote(title, excerpt)
                  setTitle('')
                  setExcerpt('')
                  setOpen(false)
                }}
              >
                Save
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-3 min-h-0 space-y-3 overflow-auto pr-1">
          {notes.map((n) => (
            <div key={n.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-slate-900">{n.title}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" /> {fmtDate(n.createdAt)}
                  </div>
                </div>
                <Button size="icon" variant="ghost" title="More" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4 text-slate-500" />
                </Button>
              </div>
              <div className="mt-2 max-h-16 overflow-hidden text-sm font-semibold text-slate-500">{n.excerpt}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(n.tags ?? []).map((t) => (
                  <Badge key={t.id} tone={t.tone}>
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </aside>
  )
}

