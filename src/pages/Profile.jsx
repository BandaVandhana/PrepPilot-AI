import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile, upsertProfile } from '../services/profileService'

const COMPANIES = ['Cisco', 'Google', 'Amazon', 'Microsoft', 'Adobe', 'Atlassian', 'Optiver', 'Flipkart', 'Walmart', 'Zoho', 'Infosys', 'TCS', 'Wipro']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const HOURS = ['1', '2', '3', '4', '5', '6']

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    target_company: 'Cisco',
    year: '3rd Year',
    dsa_level: 'Intermediate',
    daily_hours: '3',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (!user) return

  getProfile(user.id)
    .then(p => {
      if (p) {
        setForm(f => ({
          ...f,
          ...p,
          daily_hours: String(p.daily_hours),
        }))
      }
    })
    .catch(console.error)
    .finally(() => setLoading(false))
}, [user])


  const handleSave = async () => {
  setSaving(true)

  try {
    await upsertProfile(user.id, {
      target_company: form.target_company,
      year: form.year,
      dsa_level: form.dsa_level,
      daily_hours: parseInt(form.daily_hours),
    })

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  } catch (e) {
    alert('Save failed: ' + e.message)
  } finally {
    setSaving(false)
  }
}

  if (loading) return <PageLoader />

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Your profile</h1>
        <p className="text-text-secondary text-sm mt-1">This shapes your daily plans and recommendations.</p>
      </div>

      <div className="space-y-6">
        {/* Target company */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-text-primary mb-3">Target company</label>
          <div className="flex flex-wrap gap-2">
            {COMPANIES.map(c => (
              <button
                key={c}
                onClick={() => setForm(f => ({ ...f, target_company: c }))}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-100 ${
                  form.target_company === c
                    ? 'bg-accent border-accent text-white'
                    : 'border-surface-border text-text-secondary hover:border-accent/50 hover:text-text-primary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            className="input-field mt-3 text-sm"
            placeholder="Or type a company name..."
            value={COMPANIES.includes(form.target_company) ? '' : form.target_company}
            onChange={e => setForm(f => ({ ...f, target_company: e.target.value }))}
          />
        </div>

        {/* Year & Level */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card p-6">
            <label className="block text-sm font-medium text-text-primary mb-3">Year</label>
            <div className="space-y-2">
              {YEARS.map(y => (
                <label key={y} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="year"
                    value={y}
                    checked={form.year === y}
                    onChange={() => setForm(f => ({ ...f, year: y }))}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{y}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <label className="block text-sm font-medium text-text-primary mb-3">DSA level</label>
            <div className="space-y-2">
              {LEVELS.map(l => (
                <label key={l} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="radio"
                    name="level"
                    value={l}
                    checked={form.dsa_level === l}
                    onChange={() => setForm(f => ({ ...f, dsa_level: l }))}
                    className="accent-accent"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">{l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Hours per day */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-text-primary mb-3">
            Hours available daily
          </label>
          <div className="flex gap-2">
            {HOURS.map(h => (
              <button
                key={h}
                onClick={() => setForm(f => ({ ...f, daily_hours: h }))}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.daily_hours === h
                    ? 'bg-accent border-accent text-white'
                    : 'border-surface-border text-text-secondary hover:border-accent/50'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div> 

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save profile'}
        </button>
      </div>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
