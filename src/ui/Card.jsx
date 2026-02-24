import React from 'react'
import { cn } from '../lib/cn'

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-2xl border border-slate-200/70 bg-white shadow-subtle', className)}
      {...props}
    />
  )
}

