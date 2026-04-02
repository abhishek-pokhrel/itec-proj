import React from 'react'
import { cn } from '../lib/cn'

const toneClasses = {
  slate: 'bg-slate-100 text-slate-800 border-slate-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  pink: 'bg-pink-100 text-pink-800 border-pink-200',
  rose: 'bg-rose-100 text-rose-800 border-rose-200',
  high: 'bg-rose-100 text-rose-800 border-rose-200',
  medium: 'bg-amber-100 text-amber-800 border-amber-200',
  low: 'bg-cyan-100 text-cyan-800 border-cyan-200',
}

export function Badge({ className, tone = 'slate', variant, ...props }) {
  const tone_key = variant || tone
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide',
        toneClasses[tone_key] ?? toneClasses.slate,
        className,
      )}
      {...props}
    />
  )
}

