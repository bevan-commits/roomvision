import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createLandscapeProject, uploadLandscapeImages, analyzeLandscapeProject } from '../api'

const PLOT_TYPES = ['Front yard', 'Back yard', 'Rooftop garden', 'Balcony', 'Compound', 'Farm plot', 'Commercial grounds']
const STYLES = ['Tropical', 'Modern', 'Cottage', 'Zen / Minimalist', 'Indigenous / Natural', 'Formal', 'Edible garden']
const GOALS = ['More greenery', 'Privacy screening', 'Shade trees', 'Edible plants', 'Low maintenance', 'Water conservation', 'Outdoor seating', 'Kids play area']
const CLIMATE_ZONES = ['Nairobi (cool highland)', 'Mombasa (hot coastal)', 'Kisumu (lakeshore)', 'Eldoret (highland)', 'Nakuru (rift valley)', 'Arid / Semi-arid']

export default function LandscapeNew() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [plotType, setPlotType] = useState('Front yard')
  const [style, setStyle] = useState('Tropical')
  const [budget, setBudget] = useState(50000)
  const [goals, setGoals] = useState(['More greenery'])
  const [climateZone, setClimateZone] = useState('Nairobi (cool highland)')
  const [notes, setNotes] = useState('')
  const [plotFiles, setPlotFiles] = useState([])
  const [refFiles, setRefFiles] = useState([])
  const [plotPreviews, setPlotPreviews] = useState([])
  const [refPreviews, setRefPreviews] = useState([])

  const toggleGoal = (goal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handlePlotFiles = (e) => {
    const files = Array.from(e.target.files)
    setPlotFiles(files)
    setPlotPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const handleRefFiles = (e) => {
    const files = Array.from(e.target.files)
    setRefFiles(files)
    setRefPreviews(files.map((f) => URL.createObjectURL(f)))
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setError('')
    try {
      const projectRes = await createLandscapeProject({
        plot_type: plotType,
        style,
        budget_kes: budget,
        goals,
        climate_zone: climateZone,
        notes,
      })
      const projectId = projectRes.data.id

      if (plotFiles.length > 0) {
        await uploadLandscapeImages(projectId, plotFiles, 'plot')
      }
      if (refFiles.length > 0) {
        await uploadLandscapeImages(projectId, refFiles, 'reference')
      }

      await analyzeLandscapeProject(projectId)
      navigate(`/landscape/results/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const steps = ['Plot photos', 'Goals & style', 'References', 'Analyze']

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight mb-1">New landscape project</h1>
          <p className="text-stone-400 text-sm">Tell us about your outdoor space and goals</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  i === step
                    ? 'bg-green-700 text-white'
                    : i < step
                    ? 'bg-green-50 text-green-700 cursor-pointer'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs">
                  {i < step ? '✓' : i + 1}
                </span>
                {s}
              </button>
              {i < steps.length - 1 && (
                <div className={`h-px w-4 ${i < step ? 'bg-green-300' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          {step === 0 && (
            <div>
              <h2 className="font-medium text-stone-800 mb-1">Upload plot photos</h2>
              <p className="text-sm text-stone-400 mb-5">Photos of your current outdoor space. Multiple angles help. You can skip this.</p>
              <label className="block border-2 border-dashed border-stone-200 hover:border-green-400 rounded-xl p-8 text-center cursor-pointer transition-colors">
                <input type="file" accept="image/*" multiple onChange={handlePlotFiles} className="hidden" />
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
                    <path d="M10 13V4M6 7l4-4 4 4"/>
                    <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1"/>
                  </svg>
                </div>
                <p className="text-sm text-stone-500 font-medium">Click to upload plot photos</p>
                <p className="text-xs text-stone-300 mt-1">JPEG, PNG — garden, yard, compound</p>
              </label>
              {plotPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {plotPreviews.map((src, i) => (
                    <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg border border-stone-100" />
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <button onClick={() => setStep(1)} className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-medium text-stone-800 mb-5">Goals & style</h2>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Plot type</label>
                <div className="flex flex-wrap gap-2">
                  {PLOT_TYPES.map((t) => (
                    <button key={t} onClick={() => setPlotType(t)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${plotType === t ? 'bg-green-700 text-white border-green-700' : 'border-stone-200 text-stone-500 hover:border-green-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Landscape style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button key={s} onClick={() => setStyle(s)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${style === s ? 'bg-green-700 text-white border-green-700' : 'border-stone-200 text-stone-500 hover:border-green-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Climate zone</label>
                <div className="flex flex-wrap gap-2">
                  {CLIMATE_ZONES.map((z) => (
                    <button key={z} onClick={() => setClimateZone(z)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${climateZone === z ? 'bg-green-700 text-white border-green-700' : 'border-stone-200 text-stone-500 hover:border-green-400'}`}>
                      {z}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">
                  Budget — <span className="text-green-700 font-semibold">KES {budget.toLocaleString()}</span>
                </label>
                <input type="range" min="5000" max="500000" step="5000" value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-green-700" />
                <div className="flex justify-between text-xs text-stone-300 mt-1">
                  <span>KES 5,000</span><span>KES 500,000</span>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Goals</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button key={g} onClick={() => toggleGoal(g)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${goals.includes(g) ? 'bg-green-700 text-white border-green-700' : 'border-stone-200 text-stone-500 hover:border-green-400'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Additional notes</label>
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. I have a borehole, the soil is clay, I want to attract birds..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none" />
              </div>

              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(0)} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← Back</button>
                <button onClick={() => setStep(2)} className="bg-green-700 hover:bg-green-800 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors">Next →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-medium text-stone-800 mb-1">Reference images</h2>
              <p className="text-sm text-stone-400 mb-5">Upload photos of gardens or landscapes you love — from Pinterest, Google, or anywhere. The AI uses these to match your taste.</p>
              <label className="block border-2 border-dashed border-stone-200 hover:border-green-400 rounded-xl p-8 text-center cursor-pointer transition-colors">
                <input type="file" accept="image/*" multiple onChange={handleRefFiles} className="hidden" />
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
                    <rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/>
                    <rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <p className="text-sm text-stone-500 font-medium">Upload inspiration images</p>
                <p className="text-xs text-stone-300 mt-1">Gardens, parks, landscaping you admire</p>
              </label>
              {refPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {refPreviews.map((src, i) => (
                    <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg border border-stone-100" />
                  ))}
                </div>
              )}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">{error}</p>
              )}
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="text-sm text-stone-400 hover:text-stone-600 transition-colors">← Back</button>
                <button onClick={handleAnalyze} disabled={loading}
                  className="bg-green-700 hover:bg-green-800 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing your space...</>
                  ) : (
                    <>Generate landscape plan</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}