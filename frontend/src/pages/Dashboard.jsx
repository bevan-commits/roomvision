import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { getProjects, deleteProject } from '../api'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    await deleteProject(id)
    setProjects(projects.filter((p) => p.id !== id))
  }

  const formatBudget = (kes) => `KES ${kes.toLocaleString()}`

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
              Good to see you, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-stone-400 text-sm mt-1">
              Your room redesign projects
            </p>
          </div>
          <button
            onClick={() => navigate('/new-project')}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <h3 className="text-stone-700 font-medium mb-1">No projects yet</h3>
            <p className="text-stone-400 text-sm mb-6">Upload a room photo and get your first redesign plan</p>
            <button
              onClick={() => navigate('/new-project')}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Start your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => navigate(`/results/${project.id}`)}
                className="bg-white border border-stone-200 rounded-2xl p-6 cursor-pointer hover:border-teal-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-teal-600">
                      <rect x="2" y="2" width="6" height="6" rx="1"/>
                      <rect x="10" y="2" width="6" height="6" rx="1"/>
                      <rect x="2" y="10" width="6" height="6" rx="1"/>
                      <rect x="10" y="10" width="6" height="6" rx="1"/>
                    </svg>
                  </div>
                  <button
                    onClick={(e) => handleDelete(project.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9"/>
                    </svg>
                  </button>
                </div>

                <h3 className="font-medium text-stone-800 capitalize mb-1">{project.room_type}</h3>
                <p className="text-sm text-stone-400 mb-4 capitalize">{project.style} style</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                    {formatBudget(project.budget_kes)}
                  </span>
                  <span className="text-xs text-stone-300">
                    {formatDate(project.created_at)}
                  </span>
                </div>

                {project.goals?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-stone-100">
                    {project.goals.slice(0, 3).map((goal) => (
                      <span key={goal} className="text-xs text-stone-400 bg-stone-50 px-2 py-0.5 rounded-md">
                        {goal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}