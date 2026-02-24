import React from 'react'
import { cn } from '../lib/cn'

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 disabled:pointer-events-none disabled:opacity-50'
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm',
    ghost: 'hover:bg-slate-100 text-slate-700',
    soft: 'bg-slate-100 hover:bg-slate-200 text-slate-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
  }
  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-4 text-base',
    icon: 'h-10 w-10',
  }

  return (
    <button
      className={cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, className)}
      {...props}
    />
  )
}

