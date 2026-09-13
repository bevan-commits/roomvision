import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getLandscapeProject, getLandscapeSuggestion } from '../api'

function ListSection({ title, items, color = 'green' }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6">
      <h2 className={`font-medium text-${color}-700 text-sm mb-4`}>{title}</h2>
      <ul className="flex flex-col gap-3">
        {Array.isArray(items) && items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className={`w-5 h-5 bg-${color}-50 text-${color}-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5`}>
              {i + 1}
            </span>
            <span className="text-sm text-stone-600 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function LandscapeResults() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [suggestion, setSuggestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getLandscapeProject(id), getLandscapeSuggestion(id)])
      .then(([p, s]) => {
        setProject(p.data)
        setSuggestion(s.data)
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load results'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-10 h-10 border-2 border-stone-200 border-t-green-700 rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading your landscape plan...</p>
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
          <button onClick={() => navigate('/dashboard')} className="text-sm text-green-700">
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
          <div className="inline-flex items-center bg-green-50 text-green-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
            AI landscape plan
          </div>
          <h1 className="text-xl font-semibold text-stone-800 capitalize tracking-tight">
            {project?.plot_type} — {project?.style} style
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            Budget: KES {project?.budget_kes?.toLocaleString()} · {project?.climate_zone}
          </p>
          {suggestion?.overall_vision && (
            <div className="mt-4 pt-4 border-t border-stone-100">
              <p className="text-stone-600 italic text-sm leading-relaxed">
                "{suggestion.overall_vision}"
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <h2 className="font-medium text-green-700 text-sm mb-4">Plot analysis</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              {suggestion?.plot_analysis || '—'}
            </p>
          </div>

          {Array.isArray(suggestion?.zone_plan) && suggestion.zone_plan.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="font-medium text-green-700 text-sm mb-4">Zone plan</h2>
              <div className="flex flex-col gap-3">
                {suggestion.zone_plan.map((zone, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <span className="w-5 h-5 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-700">{zone.zone}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{zone.description}</p>
                      {zone.location && (
                        <p className="text-xs text-green-700 mt-0.5">📍 {zone.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(suggestion?.plant_recommendations) && suggestion.plant_recommendations.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-6">
              <h2 className="font-medium text-green-700 text-sm mb-4">Plant recommendations</h2>
              <div className="flex flex-col gap-3">
                {suggestion.plant_recommendations.map((plant, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                    <span className="w-5 h-5 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-stone-700">{plant.name}
                        <span className="ml-2 text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">{plant.type}</span>
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">{plant.reason}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-blue-600">💧 {plant.water_needs} water</span>
                        <span className="text-xs text-green-600">🌍 {plant.local_availability}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ListSection title="Hardscape suggestions" items={suggestion?.hardscape_suggestions} />
          <ListSection title="Budget priorities" items={suggestion?.budget_priorities} />
          <ListSection title="Maintenance tips" items={suggestion?.maintenance_tips} />

          <div className="bg-green-700 rounded-2xl p-6 text-white">
            <h3 className="font-medium mb-1">Ready to get started?</h3>
            <p className="text-green-100 text-sm mb-4">
              Find plants, soil, and landscaping materials at Nairobi Nurseries or Jumia Kenya.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => window.open('https://www.jumia.co.ke/gardening/', '_blank')}
                className="bg-white text-green-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-green-50 transition-colors"
              >
                Shop on Jumia
              </button>
              <button
                onClick={() => window.open('https://www.google.com/search?q=plant+nursery+nairobi+kenya', '_blank')}
                className="border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                Find nurseries
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}