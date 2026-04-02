import React from 'react'
import { cn } from '../lib/cn'

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'w-full h-10 px-4 py-2 text-sm rounded-lg border border-slate-300 bg-gradient-to-r from-white to-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:shadow-lg transition duration-200',
        className,
      )}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'min-h-24 w-full resize-y rounded-xl border border-slate-300 bg-gradient-to-br from-white to-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-900 focus:ring-2 focus:ring-blue-200',
        className,
      )}
      {...props}
    />
  )
}

