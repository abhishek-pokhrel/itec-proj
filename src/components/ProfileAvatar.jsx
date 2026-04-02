import React from 'react'
import { User } from 'lucide-react'

export function ProfileAvatar({ user, profilePicture, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-3xl',
  }

  const getInitials = (email) => {
    if (!email) return '?'
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <div
      className={`rounded-full border-2 border-gradient-to-r from-indigo-400 to-indigo-600 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-bold text-indigo-700 shadow-md overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {profilePicture ? (
        <img
          src={profilePicture}
          alt={user?.email}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(user?.email)}</span>
      )}
    </div>
  )
}
