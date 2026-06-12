import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import {
  calculateStreak,
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
        <p className="text-xs text-text-secondary mt-1">
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
          calculateStreak(user.id),
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

      <p className="text-sm mt-1 mb-6 text-text-secondary">
        Target:{" "}
        <span className="text-text-primary font-semibold">
          {profile?.target_company || 'Not Set'}
        </span>
        {" "}• {currentStreak} day streak
      </p>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

        {/* Target Company */}
        <div className="card p-4">
          <p className="text-xs text-text-muted">
            Target Company
          </p>
          <p className="mt-1 text-base font-semibold text-accent">
            {profile?.target_company || '-'}
          </p>
        </div>

        {/* DSA Level */}
        <div className="card p-4">
          <p className="text-xs text-text-muted">
            DSA Level
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            {profile?.dsa_level || '-'}
          </p>
        </div>

        {/* Current Day */}
        <div className="card p-4">
          <p className="text-xs text-text-muted">
            Current Day
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            Day {currentDay}
          </p>
        </div>

        {/* Daily Hours */}
        <div className="card p-4">
          <p className="text-xs text-text-muted">
            Daily Hours
          </p>
          <p className="mt-1 text-base font-semibold text-text-primary">
            {profile?.daily_hours || '-'}
            <span className="text-text-secondary">h</span>
          </p>
        </div>

      </div>

      {/* PROGRESS */}
      <div className="card p-5 mb-8">

        <div className="flex justify-between mb-3">
          <p className="font-medium text-text-primary">
            Today's Progress
          </p>

          <p className="text-accent font-semibold">
            {progress}%
          </p>
        </div>

        <div className="h-2 bg-surface-hover rounded-full mb-3">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="text-sm text-text-secondary">
          <span className="text-text-primary font-medium">
            {completedToday}
          </span>{" "}
          of {totalToday} tasks completed
        </p>
      </div>

      {/* RECENT HISTORY */}
      <div className="card p-5 mb-8">

        <h2 className="font-medium mb-4 text-text-primary">
          Recent Plan History
        </h2>

        <div className="space-y-2">
          {plans.slice(0, 5).map(plan => (
            <div
              key={plan.id}
              className="flex justify-between text-sm py-1"
            >
              <span className="text-text-primary font-medium">
                Day {plan.plan_day}
              </span>

              <span className="text-text-secondary">
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