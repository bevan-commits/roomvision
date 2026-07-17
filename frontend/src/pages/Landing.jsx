import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login, register } from '../api'

export default function Landing() {
  const { loginUser, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate('/dashboard')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = mode === 'register'
        ? await register(form)
        : await login(form)
      loginUser(res.data.access_token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-stone-800 tracking-tight">RoomVision</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode('login')}
            className="text-sm text-stone-600 hover:text-stone-800 transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => setMode('register')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Get started
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
              <path d="M6 1l1.2 3.6H11L8.1 6.8l1.1 3.6L6 8.2 2.8 10.4l1.1-3.6L1 4.6h3.8z"/>
            </svg>
            AI-powered interior design
          </div>

          <h1 className="text-5xl font-semibold text-stone-900 leading-tight tracking-tight mb-6">
            Transform any room with AI
          </h1>
          <p className="text-xl text-stone-500 leading-relaxed mb-10">
            Upload a photo of your room, set your budget and style goals, and get a detailed redesign plan tailored to your space — in seconds.
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setMode('register')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Start redesigning for free
            </button>
            <button
              onClick={() => setMode('login')}
              className="text-stone-600 hover:text-stone-800 font-medium transition-colors"
            >
              Sign in →
            </button>
          </div>

          <div className="flex items-center gap-8 mt-12 pt-12 border-t border-stone-200">
            {[
              { label: 'Room types', value: '10+' },
              { label: 'Design styles', value: '7' },
              { label: 'Budget range', value: 'KES 5K–500K' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-semibold text-stone-800">{stat.value}</div>
                <div className="text-sm text-stone-400 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mode && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setMode(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-stone-800 mb-1">
              {mode === 'register' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-stone-400 mb-6">
              {mode === 'register' ? 'Free to start — no credit card needed' : 'Sign in to your RoomVision account'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-medium text-stone-500 block mb-1.5">Full name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ben Mutai"
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-stone-500 block mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full border border-stone-200 rounded-lg px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors mt-1"
              >
                {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <p className="text-sm text-stone-400 text-center mt-4">
              {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                {mode === 'register' ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}