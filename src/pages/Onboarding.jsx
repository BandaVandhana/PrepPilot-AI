import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabase/client'

const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Cisco', 'Adobe',
  'Flipkart', 'Atlassian', 'Meta', 'Apple', 'Netflix',
  'Oracle', 'IBM', 'Intel', 'Nvidia', 'PayPal',
  'TCS', 'Infosys', 'Wipro', 'Accenture', 'Deloitte'
]

const DSA_LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TOPICS = ['Arrays', 'Strings', 'DP', 'Graphs', 'Trees', 'DBMS', 'OS', 'Networking']

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: '',
    year: '3rd Year',
    target_company: 'Google',
    daily_hours: 3,
    dsa_level: 'Intermediate',
    weak_topics: []
  })

  // 🔥 check if profile already exists (IMPORTANT FIX)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        navigate('/dashboard')
      }
    }

    fetchProfile()
  }, [user, navigate])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const toggleTopic = (topic) => {
    setForm(prev => ({
      ...prev,
      weak_topics: prev.weak_topics.includes(topic)
        ? prev.weak_topics.filter(t => t !== topic)
        : [...prev.weak_topics, topic]
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      // 🔥 UPSERT prevents duplicate profile errors
      const { error } = await supabase
  .from('profiles')
  .upsert({
    user_id: user.id,
    full_name: form.full_name,
    target_company: form.target_company,
    year: form.year,
    dsa_level: form.dsa_level,
    daily_hours: Number(form.daily_hours),
    weak_topics: form.weak_topics,
    updated_at: new Date()
  },
  { onConflict: 'user_id' })

      if (error) throw error

      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-primary">
        Please login first
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">

      <div className="card p-8 w-full max-w-md">

        <h1 className="text-xl font-semibold mb-6 text-text-primary">
          Step {step} of 3
        </h1>

        {error && (
          <div className="mb-4 text-red-500 text-sm">{error}</div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">

            <input
  className="input"
  placeholder="Full Name"
  value={form.full_name}
  onChange={e => handleChange('full_name', e.target.value)}
/>

            <select
              className="input"
              value={form.year}
              onChange={e => handleChange('year', e.target.value)}
            >
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>

            <button className="btn-primary w-full" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">

            <select
              className="input"
              value={form.target_company}
              onChange={e => handleChange('target_company', e.target.value)}
            >
              {COMPANIES.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              className="input"
              placeholder="Daily Study Hours"
              value={form.daily_hours}
              onChange={e => handleChange('daily_hours', Number(e.target.value))}
            />

            <div className="flex gap-2">
              <button className="btn-secondary w-full" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn-primary w-full" onClick={() => setStep(3)}>
                Next
              </button>
            </div>

          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">

            <select
              className="input"
              value={form.dsa_level}
              onChange={e => handleChange('dsa_level', e.target.value)}
            >
              {DSA_LEVELS.map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTopic(t)}
                  className={`px-3 py-1 rounded-full text-xs border ${
                    form.weak_topics.includes(t)
                      ? 'bg-accent text-white'
                      : 'border-surface-border'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button className="btn-secondary w-full" onClick={() => setStep(2)}>
                Back
              </button>

              <button
                className="btn-primary w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}