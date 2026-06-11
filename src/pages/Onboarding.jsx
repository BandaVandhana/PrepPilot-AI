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

const LEVELS = ['Beginner', 'Intermediate', 'Advanced']

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    year: '3rd Year',
    targetCompany: 'Google',
    dailyHours: 3,
    dsaLevel: 'Intermediate'
  })

  // ✅ prevent onboarding if profile already exists
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (data) {
        navigate('/dashboard')
      }
    }

    checkProfile()
  }, [user, navigate])

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: user.id,
            full_name: form.fullName,
            year: form.year,
            target_company: form.targetCompany,
            dsa_level: form.dsaLevel,
            daily_hours: Number(form.dailyHours)
          },
          { onConflict: 'user_id' }
        )

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
      <div className="min-h-screen flex items-center justify-center">
        Please login first
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="card p-8 w-full max-w-md">

        <h1 className="text-xl font-semibold mb-6">
          Step {step} of 2
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
              value={form.fullName}
              onChange={e => handleChange('fullName', e.target.value)}
            />

            <select
              className="input"
              value={form.year}
              onChange={e => handleChange('year', e.target.value)}
            >
              <option>1st Year</option>
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
              value={form.targetCompany}
              onChange={e => handleChange('targetCompany', e.target.value)}
            >
              {COMPANIES.map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              className="input"
              value={form.dsaLevel}
              onChange={e => handleChange('dsaLevel', e.target.value)}
            >
              {LEVELS.map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <input
              type="number"
              className="input"
              value={form.dailyHours}
              onChange={e => handleChange('dailyHours', e.target.value)}
              placeholder="Daily hours"
            />

            <div className="flex gap-2">
              <button className="btn-secondary w-full" onClick={() => setStep(1)}>
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