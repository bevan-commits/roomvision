import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { createProject, uploadImages, analyzeProject } from '../api'

const ROOM_TYPES = ['Bedroom', 'Living room', 'Study / office', 'Kitchen', 'Dining room', 'Airbnb unit', 'Kids room']
const STYLES = ['Minimalist', 'Modern', 'Scandinavian', 'Industrial', 'Bohemian', 'Luxury', 'Tropical']
const GOALS = ['Better layout', 'More storage', 'Better lighting', 'Study area', 'Gaming setup', 'Rental-ready', 'Kid-friendly', 'Work from home']

export default function NewProject() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [roomType, setRoomType] = useState('Bedroom')
  const [style, setStyle] = useState('Minimalist')
  const [budget, setBudget] = useState(50000)
  const [goals, setGoals] = useState(['Better layout'])
  const [notes, setNotes] = useState('')
  const [roomFiles, setRoomFiles] = useState([])
  const [refFiles, setRefFiles] = useState([])
  const [roomPreviews, setRoomPreviews] = useState([])
  const [refPreviews, setRefPreviews] = useState([])

  const toggleGoal = (goal) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const handleRoomFiles = (e) => {
    const files = Array.from(e.target.files)
    setRoomFiles(files)
    setRoomPreviews(files.map((f) => URL.createObjectURL(f)))
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
      const projectRes = await createProject({
        room_type: roomType,
        style,
        budget_kes: budget,
        goals,
        notes,
      })
      const projectId = projectRes.data.id

      if (roomFiles.length > 0) {
        await uploadImages(projectId, roomFiles, 'room')
      }
      if (refFiles.length > 0) {
        await uploadImages(projectId, refFiles, 'reference')
      }

      await analyzeProject(projectId)
      navigate(`/results/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const steps = ['Room photos', 'Goals & style', 'References', 'Analyze']

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight mb-1">New project</h1>
          <p className="text-stone-400 text-sm">Tell us about your room and goals</p>
        </div>

        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  i === step
                    ? 'bg-teal-600 text-white'
                    : i < step
                    ? 'bg-teal-50 text-teal-600 cursor-pointer'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                  i === step ? 'bg-white/20' : ''
                }`}>
                  {i < step ? '✓' : i + 1}
                </span>
                {s}
              </button>
              {i < steps.length - 1 && (
                <div className={`h-px w-4 ${i < step ? 'bg-teal-300' : 'bg-stone-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          {step === 0 && (
            <div>
              <h2 className="font-medium text-stone-800 mb-1">Upload room photos</h2>
              <p className="text-sm text-stone-400 mb-5">Multiple angles work best. You can skip this and get general advice.</p>

              <label className="block border-2 border-dashed border-stone-200 hover:border-teal-300 rounded-xl p-8 text-center cursor-pointer transition-colors">
                <input type="file" accept="image/*" multiple onChange={handleRoomFiles} className="hidden" />
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
                    <path d="M10 13V4M6 7l4-4 4 4"/>
                    <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1"/>
                  </svg>
                </div>
                <p className="text-sm text-stone-500 font-medium">Click to upload photos</p>
                <p className="text-xs text-stone-300 mt-1">JPEG, PNG — multiple angles welcome</p>
              </label>

              {roomPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {roomPreviews.map((src, i) => (
                    <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg border border-stone-100" />
                  ))}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-medium text-stone-800 mb-5">Goals & style</h2>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Room type</label>
                <div className="flex flex-wrap gap-2">
                  {ROOM_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setRoomType(t)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        roomType === t
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-stone-200 text-stone-500 hover:border-teal-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Desired style</label>
                <div className="flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStyle(s)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        style === s
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-stone-200 text-stone-500 hover:border-teal-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">
                  Budget — <span className="text-teal-600 font-semibold">KES {budget.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  min="5000"
                  max="500000"
                  step="5000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-xs text-stone-300 mt-1">
                  <span>KES 5,000</span>
                  <span>KES 500,000</span>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Goals</label>
                <div className="flex flex-wrap gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g}
                      onClick={() => toggleGoal(g)}
                      className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                        goals.includes(g)
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-stone-200 text-stone-500 hover:border-teal-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <label className="text-xs font-medium text-stone-500 block mb-2">Additional notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g. I have a low ceiling, I want to keep the existing wardrobe..."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-medium text-stone-800 mb-1">Reference images</h2>
              <p className="text-sm text-stone-400 mb-5">Upload saved images from Pinterest, Houzz, or Google of rooms you love. The AI uses these to understand your taste.</p>

              <label className="block border-2 border-dashed border-stone-200 hover:border-teal-300 rounded-xl p-8 text-center cursor-pointer transition-colors">
                <input type="file" accept="image/*" multiple onChange={handleRefFiles} className="hidden" />
                <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-stone-400">
                    <rect x="2" y="2" width="7" height="7" rx="1"/>
                    <rect x="11" y="2" width="7" height="7" rx="1"/>
                    <rect x="2" y="11" width="7" height="7" rx="1"/>
                    <rect x="11" y="11" width="7" height="7" rx="1"/>
                  </svg>
                </div>
                <p className="text-sm text-stone-500 font-medium">Upload inspiration images</p>
                <p className="text-xs text-stone-300 mt-1">Pinterest saves, Google Images downloads, Houzz photos</p>
              </label>

              {refPreviews.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {refPreviews.map((src, i) => (
                    <img key={i} src={src} className="w-full aspect-square object-cover rounded-lg border border-stone-100" />
                  ))}
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mt-4">
                  {error}
                </p>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-stone-400 hover:text-stone-600 transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Analyzing your room...
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 1l1.2 3.6H13L10.1 6.8l1.1 3.6L8 8.2 4.8 10.4l1.1-3.6L3 4.6h3.8z"/>
                      </svg>
                      Generate redesign plan
                    </>
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