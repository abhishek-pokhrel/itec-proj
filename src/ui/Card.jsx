import React from 'react'
import { cn } from '../lib/cn'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-lg border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-md hover:shadow-xl hover:border-indigo-200 transition-all duration-200', className)}
      {...props}
    />
  )
}

