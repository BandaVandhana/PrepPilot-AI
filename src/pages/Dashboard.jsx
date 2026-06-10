import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getProfile, getDailyPlans, getStreak, getProgressLogs } from '../services/profileService'
import { generateReadinessExplanation } from '../services/geminiService'
import { calculateReadinessScore, getReadinessLabel, getTodayDate } from '../utils/scoring'

function ReadinessRing({ score }) {
  const radius = 44
  const circ = 2 * Math.PI * radius
  const offset = circ - (score / 100) * circ
  const { label, color } = getReadinessLabel(score)

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-28 h-28 shrink-0">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#1C2333" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={score >= 80 ? '#10B981' : score >= 60 ? '#6366F1' : score >= 40 ? '#F59E0B' : '#475569'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-text-primary">{score}</span>
          <span className="text-xs text-text-muted">/100</span>
        </div>
      </div>
      <div>
        <p className={`text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-xs text-text-secondary mt-1">Readiness score</p>
      </div>
    </div>
  )
}

function QuickAction({ icon, label, to, sub }) {
  return (
    <Link to={to} className="card p-5 hover:border-accent/40 transition-all duration-150 group block">
      <div className="text-xl mb-3">{icon}</div>
      <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-0.5">{sub}</p>}
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [streak, setStreak] = useState(null)
  const [plans, setPlans] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [readiness, setReadiness] = useState(null)
  const [aiInsight, setAiInsight] = useState(null)
  const [loadingInsight, setLoadingInsight] = useState(false)
  const today = getTodayDate()

  useEffect(() => {
    if (!user) return
    Promise.all([
      getProfile(user.id),
      getStreak(user.id),
      getDailyPlans(user.id, 7),
      getProgressLogs(user.id, today),
    ]).then(([p, s, pl, logs]) => {
      setProfile(p)
      setStreak(s)
      setPlans(pl)
      setTodayLogs(logs)
      if (p) {
        const r = calculateReadinessScore({
          leetcodeSolved: parseInt(p.leetcode_solved || p.leetcodeSolved || 0),
          coreSubjectsCompleted: parseInt(p.core_subjects_completed || p.coreSubjectsCompleted || 0),
          projects: parseInt(p.projects || 0),
          streakDays: s?.current_streak || 0,
        })
        setReadiness(r)
      }
    })
  }, [user])

  const handleGetInsight = async () => {
    if (!profile || !readiness) return
    setLoadingInsight(true)
    try {
      const insight = await generateReadinessExplanation({
        score: readiness.total,
        leetcodeSolved: parseInt(profile.leetcode_solved || 0),
        coreSubjectsCompleted: parseInt(profile.core_subjects_completed || 0),
        projects: parseInt(profile.projects || 0),
        streakDays: streak?.current_streak || 0,
        weakTopics: profile.weak_topics || [],
      })
      setAiInsight(insight)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingInsight(false)
    }
  }

  const todayPlan = plans.find(p => p.date === today)
  const completedToday = todayLogs.filter(l => l.completed).length
  const totalToday = todayPlan?.tasks?.length || 0
  const currentStreak = streak?.current_streak || 0

  const name = user?.user_metadata?.full_name?.split(' ')?.[0] || 'there'

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">
          Hey {name} 👋
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          {profile
            ? `Preparing for ${profile.target_company || profile.targetCompany} · ${currentStreak} day streak`
            : 'Set up your profile to get started.'}
        </p>
      </div>

      {/* No profile prompt */}
      {!profile && (
        <div className="card p-6 mb-6 border-accent/30 bg-accent-glow">
          <p className="text-sm font-medium text-text-primary mb-1">Complete your profile</p>
          <p className="text-xs text-text-secondary mb-4">Tell us your target company and weak areas to get personalized plans.</p>
          <Link to="/profile" className="btn-primary text-sm inline-block">Set up profile →</Link>
        </div>
      )}

      {/* Today's summary */}
      {todayPlan && (
        <div className="card p-5 mb-5 flex items-center gap-5">
          <div className="flex-1">
            <p className="text-xs text-text-muted mb-1">Today's progress</p>
            <p className="text-sm font-medium text-text-primary">
              {completedToday}/{totalToday} tasks done
            </p>
            <div className="h-1.5 bg-surface-hover rounded-full mt-2 overflow-hidden w-48">
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${totalToday ? (completedToday / totalToday) * 100 : 0}%` }}
              />
            </div>
          </div>
          <Link to="/roadmap" className="btn-ghost text-sm">
            Continue →
          </Link>
        </div>
      )}

      {/* Readiness score */}
      {readiness && (
        <div className="card p-6 mb-5">
          <div className="flex items-start justify-between mb-5">
            <ReadinessRing score={readiness.total} />
            <button
              onClick={handleGetInsight}
              disabled={loadingInsight}
              className="btn-ghost text-xs"
            >
              {loadingInsight ? 'Analyzing...' : 'AI insight ✨'}
            </button>
          </div>

          {/* Score breakdown */}
          <div className="space-y-2.5">
            {Object.values(readiness.breakdown).map(({ label, score, max }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-text-secondary w-28 shrink-0">{label}</span>
                <div className="flex-1 h-1.5 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${(score / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-text-muted w-12 text-right">{score}/{max}</span>
              </div>
            ))}
          </div>

          {/* AI insight */}
          {aiInsight && (
            <div className="mt-5 pt-5 border-t border-surface-border">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-medium text-green-pp mb-2">Strengths</p>
                  {aiInsight.strengths?.map((s, i) => (
                    <p key={i} className="text-xs text-text-secondary mb-1">· {s}</p>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-pp mb-2">Areas to improve</p>
                  {aiInsight.weaknesses?.map((w, i) => (
                    <p key={i} className="text-xs text-text-secondary mb-1">· {w}</p>
                  ))}
                </div>
              </div>
              {aiInsight.nextStep && (
                <div className="bg-accent-glow border border-accent/20 rounded-xl p-3">
                  <p className="text-xs text-text-secondary">
                    <span className="text-accent font-medium">Next step: </span>
                    {aiInsight.nextStep}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick actions */}
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Quick access</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <QuickAction icon="🗺️" label="Generate today's plan" to="/roadmap" sub="AI-powered, personalized" />
        <QuickAction icon="💡" label="LeetCode practice" to="/leetcode" sub={profile?.weak_topics?.length ? `${profile.weak_topics.slice(0,2).join(', ')} and more` : 'By topic and company'} />
        <QuickAction icon="📈" label="View progress" to="/progress" sub={`${currentStreak} day streak`} />
        <QuickAction icon="⚙️" label="Update profile" to="/profile" sub={profile ? `${profile.target_company || profile.targetCompany}` : 'Not set up yet'} />
      </div>
    </div>
  )
}
