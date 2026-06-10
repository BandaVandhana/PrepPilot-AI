import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getProfile, saveDailyPlan, getProgressLogs, upsertProgressLog } from '../services/profileService'
import { generateDailyPlan } from '../services/geminiService'
import { getTodayDate } from '../utils/scoring'

const TYPE_CONFIG = {
  dsa: { icon: '💻', color: 'text-accent', bg: 'bg-accent/10' },
  concept: { icon: '📚', color: 'text-amber-pp', bg: 'bg-amber-dim' },
  mcq: { icon: '❓', color: 'text-green-pp', bg: 'bg-green-dim' },
  revision: { icon: '🔁', color: 'text-text-secondary', bg: 'bg-surface-hover' },
}

export default function Roadmap() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [plan, setPlan] = useState(null)
  const [completedTasks, setCompletedTasks] = useState({})
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const today = getTodayDate()

  useEffect(() => {
    if (!user) return
    Promise.all([
      getProfile(user.id),
      getProgressLogs(user.id, today),
    ]).then(([p, logs]) => {
      setProfile(p)
      const completed = {}
      logs.forEach(l => { completed[l.task_name] = l.completed })
      setCompletedTasks(completed)
    })
  }, [user])

  const handleGenerate = async () => {
    if (!profile) {
      setError('Complete your profile first.')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const result = await generateDailyPlan({
        targetCompany: profile.target_company || profile.targetCompany,
        dsaLevel: profile.dsa_level || profile.dsaLevel,
        dailyHours: profile.daily_hours || profile.dailyHours,
        weakTopics: profile.weak_topics || profile.weakTopics || [],
      })
      setPlan(result)
      await saveDailyPlan(user.id, today, result.tasks)
    } catch (e) {
      setError(e.message || 'Failed to generate plan. Check your Gemini API key.')
    } finally {
      setGenerating(false)
    }
  }

  const toggleTask = async (taskId, taskTitle) => {
    const next = !completedTasks[taskId]
    setCompletedTasks(c => ({ ...c, [taskId]: next }))
    try {
      await upsertProgressLog(user.id, taskId, next, today)
    } catch (e) {
      console.error(e)
    }
  }

  const completedCount = Object.values(completedTasks).filter(Boolean).length
  const totalTasks = plan?.tasks?.length || 0
  const progressPct = totalTasks ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Today's plan</h1>
          <p className="text-text-secondary text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-primary text-sm shrink-0"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : plan ? 'Regenerate' : 'Generate plan'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-dim border border-red-pp/20 text-red-pp text-sm">
          {error}
        </div>
      )}

      {!profile && (
        <div className="card p-8 text-center">
          <p className="text-text-secondary text-sm mb-4">Set up your profile first so we can personalize your plan.</p>
          <a href="/profile" className="btn-primary text-sm inline-block">Go to Profile →</a>
        </div>
      )}

      {profile && !plan && !generating && (
        <div className="card p-10 text-center border-dashed">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-text-primary font-medium mb-2">No plan yet for today</p>
          <p className="text-text-secondary text-sm mb-6">
            Target: <span className="text-accent">{profile.target_company || profile.targetCompany}</span> · {profile.daily_hours || profile.dailyHours}h available
          </p>
          <button onClick={handleGenerate} className="btn-primary">Generate today's plan</button>
        </div>
      )}

      {plan && (
        <>
          {plan.greeting && (
            <div className="mb-5 p-4 rounded-xl bg-accent-glow border border-accent/20">
              <p className="text-sm text-text-secondary">{plan.greeting}</p>
            </div>
          )}

          {/* Progress bar */}
          {totalTasks > 0 && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-text-muted mb-2">
                <span>{completedCount}/{totalTasks} tasks done</span>
                <span className={progressPct >= 60 ? 'text-green-pp' : 'text-text-muted'}>
                  {progressPct}% · {progressPct >= 60 ? '🔥 Streak day!' : `${60 - progressPct}% to streak`}
                </span>
              </div>
              <div className="h-1.5 bg-surface-hover rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressPct >= 60 ? 'bg-green-pp' : 'bg-accent'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Tasks */}
          <div className="space-y-3">
            {plan.tasks.map((task, i) => {
              const cfg = TYPE_CONFIG[task.type] || TYPE_CONFIG.revision
              const done = completedTasks[task.id]
              return (
                <div
                  key={task.id}
                  className={`card p-4 flex items-start gap-4 transition-all duration-150 ${
                    done ? 'opacity-60' : 'hover:border-surface-border/80'
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleTask(task.id, task.title)}
                    className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      done
                        ? 'bg-green-pp border-green-pp'
                        : 'border-surface-border hover:border-accent'
                    }`}
                  >
                    {done && <span className="text-white text-xs">✓</span>}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                        {cfg.icon} {task.type}
                      </span>
                      <span className="text-xs text-text-muted">{task.duration} min</span>
                    </div>
                    <p className={`text-sm font-medium ${done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-text-secondary mt-0.5">{task.description}</p>
                    )}
                  </div>

                  {/* LC Link */}
                  {task.lcUrl && (
                    <a
                      href={task.lcUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-accent hover:underline shrink-0 mt-1"
                    >
                      Open ↗
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
