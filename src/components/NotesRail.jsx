import React, { useState } from 'react'
import { Plus } from 'lucide-react'
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

export function NotesRail({ notes, onAddNote }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')

  return (
    <aside className="hidden min-h-0 flex-col gap-4 lg:flex">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">Notes</div>
        <Button size="icon" variant="soft" title="New note" onClick={() => setOpen((v) => !v)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {open ? (
        <Card className="p-4">
          <div className="space-y-3">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" />
            <Textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Write a quick note…"
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
                Add note
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="min-h-0 space-y-3 overflow-auto pr-1">
        {notes.map((n) => (
          <Card key={n.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-extrabold text-slate-900">{n.title}</div>
                <div className="mt-1 text-xs font-semibold text-slate-400">{fmtDate(n.createdAt)}</div>
              </div>
              <Button size="icon" variant="ghost" title="More">
                <span className="text-xl leading-none text-slate-500">…</span>
              </Button>
            </div>
            <div className="mt-2 max-h-16 overflow-hidden text-sm font-semibold text-slate-600">
              {n.excerpt}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(n.tags ?? []).map((t) => (
                <Badge key={t.id} tone={t.tone}>
                  {t.label}
                </Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </aside>
  )
}

