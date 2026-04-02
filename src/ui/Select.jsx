import React from 'react'
import { cn } from '../lib/cn'

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-gradient-to-r from-white to-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent focus:shadow-lg transition duration-200 cursor-pointer hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100',
        className,
      )}
      {...props}
    />
  )
}
