import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useAuth } from '../state/authContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 -right-40 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
      
      <div className="max-w-md w-full relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-900 to-slate-800 rounded-2xl shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">TaskFlow</h1>
          <p className="text-slate-600">Manage projects and tasks with ease</p>
        </div>

        <div className="bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl shadow-2xl border border-slate-200 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="text-rose-700 text-sm bg-rose-50 border border-rose-200 p-4 rounded-lg flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-900">Email Address</label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-900">Password</label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-slate-600 text-sm text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-900 hover:text-slate-800 font-semibold transition">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <p>Demo credentials: any email • any password</p>
        </div>
      </div>
    </div>
  )
}