import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getProject, getSuggestion } from '../api'

function ListSection({ title, items }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <h2 className="font-medium text-teal-700 text-sm mb-4">{title}</h2>
      <ul className="flex flex-col gap-3">
        {Array.isArray(items) && items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="w-5 h-5 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              {i + 1}
            </span>
            <span className="text-sm text-stone-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Results() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getProject(id), getSuggestion(id)])
      .then(([p, s]) => {
        setProject(p.data)
        setSuggestion(s.data)
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-10 h-10 border-2 border-stone-200 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading your redesign plan...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-teal-600">
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-stone-400 hover:text-stone-600 transition-colors mb-6"
        >
          Back to dashboard
        </button>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
          <div className="inline-flex items-center bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            AI redesign plan
          </div>
          <h1 className="text-xl font-semibold text-stone-800 capitalize tracking-tight">
            {project?.room_type} — {project?.style} style
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Budget: KES {project?.budget_kes?.toLocaleString()}
          </p>
          {suggestion?.overall_vibe && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-stone-600 italic text-sm leading-relaxed">
                "{suggestion.overall_vibe}"
              </p>
            </div>
          )}
          {suggestion?.color_palette?.length > 0 && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-stone-400">Color palette:</span>
              {suggestion.color_palette.map((color, i) => (
                <span key={i} className="text-xs bg-stone-50 border border-stone-200 text-stone-600 px-2.5 py-1 rounded-full">
                  {color}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="font-medium text-teal-700 text-sm mb-4">Room analysis</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              {suggestion?.room_analysis || '—'}
            </p>
          </div>

          <ListSection title="Layout recommendations" items={suggestion?.layout_recs} />
          <ListSection title="Furniture changes" items={suggestion?.furniture_changes} />
          <ListSection title="Budget priorities" items={suggestion?.budget_priorities} />

          <div className="bg-teal-600 rounded-2xl p-6 text-white">
            <h3 className="font-medium mb-1">Ready to shop?</h3>
            <p className="text-teal-100 text-sm mb-4">
              Find furniture matching your redesign plan on Jumia Kenya.
            </p>
            <button
              onClick={() => window.open('https://www.jumia.co.ke', '_blank')}
              className="bg-white text-teal-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-teal-50 transition-colors"
            >
              Browse on Jumia
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}