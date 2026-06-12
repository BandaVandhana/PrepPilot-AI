import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getDailyPlans, getProgressLogs, getStreak } from '../services/profileService'

function StatCard({ label, value, sub, color = 'text-text-primary' }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-text-muted mb-2">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-text-secondary mt-1">{sub}</p>}
    </div>
  )
}

export default function Progress() {
  const { user } = useAuth()
  const [streak, setStreak] = useState(null)
  const [plans, setPlans] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getStreak(user.id),
      getDailyPlans(user.id, 14),
      getProgressLogs(user.id),
    ]).then(([s, p, l]) => {
      setStreak(s)
      setPlans(p)
      setLogs(l)
    }).finally(() => setLoading(false))
  }, [user])

  const currentStreak = streak?.current_streak || 0
  const bestStreak = streak?.best_streak || 0
  const totalTasksCompleted =
  logs.filter(l => l.completed).length

const currentDay =
  Math.max(
    0,
    ...plans.map(p => Number(p.plan_day) || 0)
  )

const totalStudyHours =
  plans.reduce((sum, plan) => {
    const mins =
      plan.tasks?.reduce(
        (t, task) => t + (task.duration || 0),
        0
      ) || 0

    return sum + mins
  }, 0)

const studyHours =
  (totalStudyHours / 60).toFixed(1)

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text-primary">Progress</h1>
        <p className="text-text-secondary text-sm mt-1">Every day you show up, you get closer.</p>
      </div>

      {/* Streak banner */}
      <div className={`card p-6 mb-6 flex items-center gap-5 ${
        currentStreak >= 7 ? 'border-green-pp/30 bg-green-dim' : ''
      }`}>
        <div className="text-4xl">{currentStreak >= 7 ? '🔥' : '⚡'}</div>
        <div>
          <p className="text-3xl font-semibold text-text-primary">{currentStreak} day{currentStreak !== 1 ? 's' : ''}</p>
          <p className="text-sm text-text-secondary mt-0.5">
            Current streak · Best: {bestStreak} days
          </p>
        </div>
        {currentStreak === 0 && (
          <div className="ml-auto text-right">
            <p className="text-xs text-text-muted">Complete ≥ 60% of today's tasks to start your streak.</p>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

  <StatCard
    label="Current Streak"
    value={`${currentStreak}d`}
    color="text-green-pp"
  />

  <StatCard
    label="Best Streak"
    value={`${bestStreak}d`}
  />

  <StatCard
    label="Current Day"
    value={`Day ${currentDay}`}
  />

  <StatCard
    label="Tasks Done"
    value={totalTasksCompleted}
  />

</div>
<div className="card p-5 mb-8">

  <h2 className="font-medium mb-4">
    Study Analytics
  </h2>

  <div className="grid grid-cols-2 gap-4">

    <div>
      <p className="text-xs text-text-muted">
        Plans Generated
      </p>

      <p className="text-xl font-semibold">
        {plans.length}
      </p>
    </div>

    <div>
      <p className="text-xs text-text-muted">
        Study Hours
      </p>

      <p className="text-xl font-semibold">
        {studyHours}h
      </p>
    </div>

  </div>

</div>
<div className="card p-5 mb-8">

  <h2 className="font-medium mb-4">
    Achievements
  </h2>

  <div className="flex flex-wrap gap-2">

    {plans.length >= 1 && (
      <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs">
        🚀 First Plan
      </span>
    )}

    {currentStreak >= 3 && (
      <span className="px-3 py-1 rounded-full bg-green-dim text-green-pp text-xs">
        🔥 3 Day Streak
      </span>
    )}

    {currentStreak >= 7 && (
      <span className="px-3 py-1 rounded-full bg-green-dim text-green-pp text-xs">
        🔥 7 Day Streak
      </span>
    )}

    {totalTasksCompleted >= 25 && (
      <span className="px-3 py-1 rounded-full bg-amber-dim text-amber-pp text-xs">
        🏆 25 Tasks
      </span>
    )}

  </div>

</div>

      {/* Recent plans */}
      <h2 className="text-sm font-semibold text-text-primary mb-4">Recent activity</h2>

      {plans.length === 0 ? (
        <div className="card p-8 text-center border-dashed">
          <p className="text-text-secondary text-sm">No plans generated yet. Head to Today's Plan to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...plans]
          .sort((a, b) => b.plan_day - a.plan_day)
          .map(plan => {
            const taskCount = plan.tasks?.length || 0
            const date = new Date(plan.date)
            const isToday = plan.date === new Date().toISOString().split('T')[0]

            return (
              <div key={plan.id} className="card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-surface-hover flex flex-col items-center justify-center shrink-0">
                  <span className="text-xs font-semibold text-text-primary leading-none">
                    {date.getDate()}
                  </span>
                  <span className="text-[10px] text-text-muted leading-none">
                    {date.toLocaleDateString('en', { month: 'short' })}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {isToday ? 'Today' : date.toLocaleDateString('en', { weekday: 'long' })}
                  </p>
                  <p className="text-xs text-text-secondary">{taskCount} task{taskCount !== 1 ? 's' : ''} planned</p>
                </div>
                <div className="text-xs text-text-muted">Plan generated</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
