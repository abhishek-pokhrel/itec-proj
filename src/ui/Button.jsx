import React from 'react'
import { cn } from '../lib/cn'

export function Button({ className, variant = 'primary', size = 'md', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-900 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-gradient-to-r from-blue-900 via-blue-900 to-slate-800 hover:from-slate-800 hover:via-slate-800 hover:to-slate-900 text-white shadow-lg hover:shadow-2xl hover:scale-105',
    ghost: 'hover:bg-gradient-to-r hover:from-slate-100 to-slate-200 text-slate-700 hover:text-slate-900',
    soft: 'bg-gradient-to-r from-slate-200 to-slate-300 hover:from-slate-300 hover:to-slate-400 text-slate-800 hover:text-slate-900',
    danger: 'bg-gradient-to-r from-red-700 via-red-700 to-red-800 hover:from-red-800 hover:via-red-800 hover:to-red-900 text-white shadow-lg hover:shadow-2xl hover:scale-105',
    success: 'bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-700 hover:from-emerald-700 hover:via-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-2xl hover:scale-105',
    outline: 'border-2 border-transparent bg-gradient-to-r from-blue-900 to-slate-800 bg-clip-border text-white hover:from-slate-800 hover:to-slate-900',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs tracking-wide',
    md: 'h-10 px-4 text-sm tracking-wide',
    lg: 'h-12 px-6 text-base tracking-wide',
    icon: 'h-10 w-10',
  }

  return (
    <button
      className={cn(base, variants[variant] ?? variants.primary, sizes[size] ?? sizes.md, className)}
      {...props}
    />
  )
}

