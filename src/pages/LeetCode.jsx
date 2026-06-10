import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile } from '../services/profileService'
import { getRecommendations, ALL_TOPICS } from '../data/recommendationEngine'

const DIFF_CONFIG = {
  Easy: { badge: 'badge-easy', label: 'Easy' },
  Medium: { badge: 'badge-medium', label: 'Medium' },
  Hard: { badge: 'badge-hard', label: 'Hard' },
}

function ProblemCard({ problem, company }) {
  const cfg = DIFF_CONFIG[problem.difficulty]
  const isTagged = problem.companyTags?.includes(company)

  return (
    <a
      href={problem.url}
      target="_blank"
      rel="noreferrer"
      className="card p-4 flex items-center gap-4 hover:border-accent/40 transition-all duration-150 group"
    >
      <div className="w-9 h-9 rounded-lg bg-surface-hover flex items-center justify-center text-xs font-mono text-text-muted shrink-0">
        {problem.id}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
          {problem.title}
        </p>
        <p className="text-xs text-text-muted mt-0.5">{problem.topic}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isTagged && (
          <span className="text-xs text-green-pp bg-green-dim px-2 py-0.5 rounded-full">
            {company}
          </span>
        )}
        <span className={cfg.badge}>{cfg.label}</span>
        <span className="text-text-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
      </div>
    </a>
  )
}

function Section({ title, problems, company, color }) {
  const [open, setOpen] = useState(true)
  if (!problems.length) return null

  return (
    <div className="mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 mb-3 group"
      >
        <span className={`text-sm font-semibold ${color}`}>{title}</span>
        <span className={`badge ${
          title === 'Easy' ? 'badge-easy' : title === 'Medium' ? 'badge-medium' : 'badge-hard'
        }`}>
          {problems.length}
        </span>
        <span className="text-text-muted text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="space-y-2">
          {problems.map(p => (
            <ProblemCard key={p.id} problem={p} company={company} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LeetCode() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [selectedTopics, setSelectedTopics] = useState([])
  const [results, setResults] = useState(null)

  useEffect(() => {
    if (!user) return
    getProfile(user.id).then(p => {
      if (p) {
        setProfile(p)
        const weak = p.weak_topics || p.weakTopics || []
        // Pre-select weak topics from profile (only DSA ones)
        const dsaTopics = weak.filter(t => ALL_TOPICS.includes(t))
        setSelectedTopics(dsaTopics)
      }
    })
  }, [user])

  useEffect(() => {
    if (selectedTopics.length) {
      const company = profile?.target_company || profile?.targetCompany
      setResults(getRecommendations(selectedTopics, company))
    } else {
      setResults(null)
    }
  }, [selectedTopics, profile])

  const toggleTopic = (t) => {
    setSelectedTopics(s =>
      s.includes(t) ? s.filter(x => x !== t) : [...s, t]
    )
  }

  const company = profile?.target_company || profile?.targetCompany || ''
  const total = results ? results.easy.length + results.medium.length + results.hard.length : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">LeetCode recommendations</h1>
        <p className="text-text-secondary text-sm mt-1">
          Curated by topic and tagged for{' '}
          <span className="text-accent">{company || 'your target company'}</span>.
        </p>
      </div>

      {/* Topic selector */}
      <div className="card p-5 mb-6">
        <p className="text-xs font-medium text-text-secondary mb-3 uppercase tracking-wider">Filter by topic</p>
        <div className="flex flex-wrap gap-2">
          {ALL_TOPICS.map(t => (
            <button
              key={t}
              onClick={() => toggleTopic(t)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-100 ${
                selectedTopics.includes(t)
                  ? 'bg-accent/10 border-accent text-accent font-medium'
                  : 'border-surface-border text-text-secondary hover:border-accent/40'
              }`}
            >
              {selectedTopics.includes(t) && '✓ '}{t}
            </button>
          ))}
        </div>
      </div>

      {!selectedTopics.length && (
        <div className="card p-10 text-center border-dashed">
          <div className="text-4xl mb-3">💡</div>
          <p className="text-text-secondary text-sm">Select one or more topics to see recommendations.</p>
          {profile?.weak_topics?.length > 0 && (
            <p className="text-xs text-text-muted mt-2">
              Your weak topics: {(profile.weak_topics || []).join(', ')}
            </p>
          )}
        </div>
      )}

      {results && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-text-secondary">
              <span className="text-text-primary font-medium">{total}</span> problems across {selectedTopics.length} topic{selectedTopics.length > 1 ? 's' : ''}
            </p>
            {company && (
              <span className="text-xs text-text-muted">
                🏢 {company}-tagged problems shown first
              </span>
            )}
          </div>

          <Section title="Easy" problems={results.easy} company={company} color="text-green-pp" />
          <Section title="Medium" problems={results.medium} company={company} color="text-amber-pp" />
          <Section title="Hard" problems={results.hard} company={company} color="text-red-pp" />
        </>
      )}
    </div>
  )
}
