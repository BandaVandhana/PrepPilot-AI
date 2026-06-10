import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile, upsertProfile } from '../services/profileService'

const COMPANIES = ['Cisco', 'Google', 'Amazon', 'Microsoft', 'Adobe', 'Atlassian', 'Optiver', 'Flipkart', 'Walmart', 'Zoho', 'Infosys', 'TCS', 'Wipro']
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced']
const TOPICS = ['Arrays', 'Strings', 'Linked List', 'Trees', 'Graphs', 'DP', 'Heap', 'Binary Search', 'Backtracking', 'Greedy', 'OS', 'DBMS', 'CN', 'OOP']
const HOURS = ['1', '2', '3', '4', '5', '6']

export default function Profile() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    targetCompany: 'Cisco',
    year: '3rd Year',
    dsaLevel: 'Intermediate',
    dailyHours: '3',
    weakTopics: [],
    leetcodeSolved: '0',
    coreSubjectsCompleted: '0',
    projects: '0',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getProfile(user.id)
      .then(p => { if (p) setForm(f => ({ ...f, ...p })) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user])

  const toggleTopic = (topic) => {
    setForm(f => ({
      ...f,
      weakTopics: f.weakTopics.includes(topic)
        ? f.weakTopics.filter(t => t !== topic)
        : [...f.weakTopics, topic],
    }))
  }

  const handleSave = async () => {
  setSaving(true)

  try {
    await upsertProfile(user.id, {
      target_company: form.targetCompany,
      year: form.year,
      dsa_level: form.dsaLevel,
      daily_hours: parseInt(form.dailyHours),
      weak_topics: form.weakTopics,
      leetcode_solved: parseInt(form.leetcodeSolved),
      core_subjects_completed: parseInt(form.coreSubjectsCompleted),
      projects: parseInt(form.projects),
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
                onClick={() => setForm(f => ({ ...f, targetCompany: c }))}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-100 ${
                  form.targetCompany === c
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
            value={COMPANIES.includes(form.targetCompany) ? '' : form.targetCompany}
            onChange={e => setForm(f => ({ ...f, targetCompany: e.target.value }))}
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
                    checked={form.dsaLevel === l}
                    onChange={() => setForm(f => ({ ...f, dsaLevel: l }))}
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
                onClick={() => setForm(f => ({ ...f, dailyHours: h }))}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  form.dailyHours === h
                    ? 'bg-accent border-accent text-white'
                    : 'border-surface-border text-text-secondary hover:border-accent/50'
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* Weak topics */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-text-primary mb-1">Weak topics</label>
          <p className="text-xs text-text-muted mb-3">Select all that apply — your plan will prioritize these.</p>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map(t => (
              <button
                key={t}
                onClick={() => toggleTopic(t)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-100 ${
                  form.weakTopics.includes(t)
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'border-surface-border text-text-secondary hover:border-accent/50'
                }`}
              >
                {form.weakTopics.includes(t) && '✓ '}{t}
              </button>
            ))}
          </div>
        </div>

        {/* Stats for readiness score */}
        <div className="card p-6">
          <label className="block text-sm font-medium text-text-primary mb-1">Progress stats</label>
          <p className="text-xs text-text-muted mb-4">Used to calculate your readiness score. Update as you go.</p>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-text-secondary mb-1 block">LeetCode solved</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.leetcodeSolved}
                onChange={e => setForm(f => ({ ...f, leetcodeSolved: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Core subjects done (/ 5)</label>
              <input
                type="number"
                min="0"
                max="5"
                className="input-field"
                value={form.coreSubjectsCompleted}
                onChange={e => setForm(f => ({ ...f, coreSubjectsCompleted: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary mb-1 block">Projects</label>
              <input
                type="number"
                min="0"
                className="input-field"
                value={form.projects}
                onChange={e => setForm(f => ({ ...f, projects: e.target.value }))}
              />
            </div>
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
