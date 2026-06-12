import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import {
  getStreak,
  getDailyPlans,
  getProgressLogs,
} from '../services/profileService'

import { getTodayDate } from '../utils/scoring'

function QuickAction({ icon, label, to, sub }) {
  return (
    <Link
      to={to}
      className="card p-5 hover:border-accent/40 transition-all block"
    >
      <div className="text-xl mb-2">{icon}</div>

      <p className="text-sm font-medium text-text-primary">
        {label}
      </p>

      {sub && (
        <p className="text-xs text-text-muted mt-1">
          {sub}
        </p>
      )}
    </Link>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { profile, loading } = useProfile()

  const [streak, setStreak] = useState(null)
  const [plans, setPlans] = useState([])
  const [todayLogs, setTodayLogs] = useState([])

  const today = getTodayDate()

  useEffect(() => {
    if (!user) return

    const load = async () => {
      try {
        const [s, pl, logs] = await Promise.all([
          getStreak(user.id),
          getDailyPlans(user.id, 7),
          getProgressLogs(user.id, today),
        ])

        setStreak(s)
        setPlans(pl)
        setTodayLogs(logs)
      } catch (err) {
        console.error(err)
      }
    }

    load()
  }, [user, today])

  if (loading) {
    return (
      <div className="text-center mt-10 text-text-secondary">
        Loading dashboard...
      </div>
    )
  }

  const name =
    user?.user_metadata?.full_name?.split(' ')[0] || 'there'

  const todayPlan = plans.find(p => p.date === today)

  const completedToday =
    todayLogs.filter(l => l.completed).length

  const totalToday =
    todayPlan?.tasks?.length || 0

  const progress =
    totalToday > 0
      ? Math.round((completedToday / totalToday) * 100)
      : 0

  const currentStreak =
    streak?.current_streak || 0

  const currentDay =
    todayPlan?.plan_day || plans[0]?.plan_day || 1

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* HEADER */}

      <h1 className="text-2xl font-semibold text-text-primary">
        Hey {name} 👋
      </h1>

      <p className="text-text-secondary text-sm mt-1 mb-6">
        Target: {profile?.target_company || 'Not Set'} •{' '}
        {currentStreak} day streak
      </p>

      {/* MAIN STATS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        <div className="card p-4">
          <p className="text-xs text-text-muted">
            Target Company
          </p>

          <p className="text-lg font-semibold mt-1">
            {profile?.target_company || '-'}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-text-muted">
            DSA Level
          </p>

          <p className="text-lg font-semibold mt-1">
            {profile?.dsa_level || '-'}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-text-muted">
            Current Day
          </p>

          <p className="text-lg font-semibold mt-1">
            Day {currentDay}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-xs text-text-muted">
            Daily Hours
          </p>

          <p className="text-lg font-semibold mt-1">
            {profile?.daily_hours || '-'}h
          </p>
        </div>

      </div>

      {/* TODAY'S PROGRESS */}

      <div className="card p-5 mb-8">

        <div className="flex justify-between mb-3">
          <p className="font-medium">
            Today's Progress
          </p>

          <p className="text-accent font-medium">
            {progress}%
          </p>
        </div>

        <div className="h-2 bg-surface-hover rounded-full mb-3">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="text-sm text-text-secondary">
          {completedToday} of {totalToday} tasks completed
        </p>

      </div>

      {/* RECENT DAYS */}

      <div className="card p-5 mb-8">

        <h2 className="font-medium mb-4">
          Recent Plan History
        </h2>

        <div className="space-y-2">

          {plans.slice(0, 5).map(plan => (
            <div
              key={plan.id}
              className="flex justify-between text-sm"
            >
              <span>
                Day {plan.plan_day}
              </span>

              <span className="text-text-muted">
                {plan.date}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* QUICK ACTIONS */}

      <div className="grid grid-cols-2 gap-4">

        <QuickAction
          icon="🗺️"
          label="Roadmap"
          to="/roadmap"
          sub="Today's AI generated plan"
        />

        <QuickAction
          icon="📊"
          label="Progress"
          to="/progress"
          sub={`${currentStreak} day streak`}
        />

        <QuickAction
          icon="⚙️"
          label="Profile"
          to="/profile"
          sub="Update preferences"
        />

        <QuickAction
          icon="🎯"
          label="Target"
          to="/profile"
          sub={profile?.target_company || 'Choose company'}
        />

      </div>

    </div>
  )
}