import { useContext } from 'react'
import { AppContext } from './appContext'

export function useApp() {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used within AppProvider')
  return value
}

