import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logoutUser()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-stone-200 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.6" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.3" />
            </svg>
          </div>
          <span className="font-semibold text-stone-800 tracking-tight">RoomVision</span>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-stone-500">
            {user?.name}
          </span>
          <Link
            to="/new-project"
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            New project
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}