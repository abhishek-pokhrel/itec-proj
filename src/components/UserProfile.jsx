import React from 'react'
import { User } from 'lucide-react'

export default function UserProfile({ user }) {
  const getInitials = (email) => {
    if (!email) return '?'
    const parts = email.split('@')[0].split('.')
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-indigo-50 p-6 shadow-sm">
      {/* Profile Picture */}
      <div className="flex flex-col items-center mb-6">
        <div className="h-24 w-24 rounded-full border-4 border-blue-300 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-4xl font-bold text-blue-900 shadow-lg">
          {getInitials(user?.email)}
        </div>
      </div>

      {/* User Info */}
      <div className="space-y-4">
        {user?.name && (
          <div className="rounded-lg bg-white/50 p-3 border border-slate-200/50">
            <p className="text-xs font-semibold text-slate-600 mb-1 flex items-center gap-2">
              <User className="h-3.5 w-3.5" />
              Name
            </p>
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
          </div>
        )}
      </div>
    </div>
  )
}
