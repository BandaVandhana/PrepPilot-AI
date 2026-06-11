import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import { getStreak, getDailyPlans, getProgressLogs } from '../services/profileService'
import { calculateReadinessScore, getTodayDate } from '../utils/scoring'

function QuickAction({ icon, label, to, sub }) {
  return (
    <Link
      to={to}
      className="card p-5 hover:border-accent/40 transition-all block"
    >
      <div className="text-xl mb-2">{icon}</div>
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { profile, loading } = useProfile()

  const [streak, setStreak] = useState(null)
  const [plans, setPlans] = useState([])
  const [todayLogs, setTodayLogs] = useState([])
  const [readiness, setReadiness] = useState(null)

  const today = getTodayDate()

  useEffect(() => {
    if (!user) return

    const load = async () => {
      const [s, pl, logs] = await Promise.all([
        getStreak(user.id),
        getDailyPlans(user.id, 7),
        getProgressLogs(user.id, today),
      ])

      setStreak(s)
      setPlans(pl)
      setTodayLogs(logs)

      if (profile) {
        const score = calculateReadinessScore({
          leetcodeSolved: profile.leetcode_solved || 0,
          coreSubjectsCompleted: profile.core_subjects_completed || 0,
          projects: profile.projects || 0,
          streakDays: s?.current_streak || 0,
        })

        setReadiness(score)
      }
    }

    load()
  }, [user, profile])

  if (loading) {
    return (
      <div className="text-center mt-10 text-text-secondary">
        Loading dashboard...
      </div>
    )
  }

  const name = user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const todayPlan = plans.find(p => p.date === today)
  const completedToday = todayLogs.filter(l => l.completed).length
  const totalToday = todayPlan?.tasks?.length || 0
  const currentStreak = streak?.current_streak || 0

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <h1 className="text-2xl font-semibold text-text-primary">
        Hey {name} 👋
      </h1>

      <p className="text-text-secondary text-sm mt-1 mb-6">
        {profile
          ? `Target: ${profile.target_company} • ${currentStreak} day streak`
          : 'Complete onboarding to start your plan'}
      </p>

      {/* Profile missing */}
      {!profile && (
        <div className="card p-5 mb-6 border-accent/30">
          <p className="text-sm font-medium">Complete onboarding first</p>
          <Link to="/onboarding" className="btn-primary mt-3 inline-block text-sm">
            Start onboarding
          </Link>
        </div>
      )}

      {/* Quick stats */}
      {profile && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <p className="text-xs text-text-muted">Company</p>
            <p className="text-sm font-medium">{profile.target_company}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-text-muted">DSA Level</p>
            <p className="text-sm font-medium">{profile.dsa_level}</p>
          </div>

          <div className="card p-4">
            <p className="text-xs text-text-muted">Daily Hours</p>
            <p className="text-sm font-medium">{profile.daily_hours}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {todayPlan && (
        <div className="card p-5 mb-6">
          <p className="text-sm font-medium mb-2">Today's Progress</p>

          <p className="text-xs text-text-muted mb-2">
            {completedToday}/{totalToday} tasks done
          </p>

          <div className="h-2 bg-surface-hover rounded-full">
            <div
              className="h-full bg-accent rounded-full"
              style={{
                width: `${totalToday ? (completedToday / totalToday) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon="🗺️" label="Roadmap" to="/roadmap" sub="Daily AI plan" />
        <QuickAction icon="💡" label="LeetCode" to="/leetcode" sub="Practice by topic" />
        <QuickAction icon="📊" label="Progress" to="/progress" sub={`${currentStreak} day streak`} />
        <QuickAction icon="⚙️" label="Profile" to="/profile" sub="Update preferences" />
      </div>
    </div>
  )
}