import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase/client'
import { useAuth } from '../hooks/useAuth'

export default function Onboarding() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    target_company: '',
    year: '',
    dsa_level: '',
    daily_hours: '',
    weak_topics: '',
    core_subjects_completed: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('profiles')
        .update({
          target_company: form.target_company,
          year: form.year,
          dsa_level: form.dsa_level,
          daily_hours: Number(form.daily_hours),
          weak_topics: form.weak_topics.split(',').map(t => t.trim()),
          core_subjects_completed: Number(form.core_subjects_completed),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (error) throw error

      navigate('/dashboard')
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="card p-8 w-full max-w-md">

        <h1 className="text-xl font-semibold mb-4">
          Setup Your Prep Profile
        </h1>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <input
              name="target_company"
              placeholder="Target Company (Google, Amazon...)"
              onChange={handleChange}
              className="input mb-3"
            />

            <input
              name="year"
              placeholder="Year (2nd/3rd/Final)"
              onChange={handleChange}
              className="input"
            />

            <button
              className="btn-primary w-full mt-4"
              onClick={() => setStep(2)}
            >
              Next
            </button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <input
              name="dsa_level"
              placeholder="DSA Level (Beginner/Intermediate/Advanced)"
              onChange={handleChange}
              className="input mb-3"
            />

            <input
              name="daily_hours"
              placeholder="Daily Study Hours"
              onChange={handleChange}
              className="input"
            />

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(1)} className="btn-secondary w-full">
                Back
              </button>

              <button onClick={() => setStep(3)} className="btn-primary w-full">
                Next
              </button>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <input
              name="weak_topics"
              placeholder="Weak Topics (comma separated)"
              onChange={handleChange}
              className="input mb-3"
            />

            <input
              name="core_subjects_completed"
              placeholder="Core Subjects Completed (0-10)"
              onChange={handleChange}
              className="input"
            />

            <div className="flex gap-2 mt-4">
              <button onClick={() => setStep(2)} className="btn-secondary w-full">
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Saving...' : 'Finish'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}