/**
 * Calculates placement readiness score (0-100) using weighted formula.
 * DSA 40% | Core Subjects 20% | Projects 20% | Consistency 20%
 */
export function calculateReadinessScore({ leetcodeSolved, coreSubjectsCompleted, projects, streakDays }) {
  // DSA score (40 pts): 300 problems = full score
  const dsaScore = Math.min(40, Math.round((leetcodeSolved / 300) * 40))

  // Core subjects score (20 pts): 5 subjects = full score
  const coreScore = Math.min(20, Math.round((coreSubjectsCompleted / 5) * 20))

  // Projects score (20 pts): 3 projects = full score
  const projectScore = Math.min(20, Math.round((projects / 3) * 20))

  // Consistency score (20 pts): 90 day streak = full score
  const consistencyScore = Math.min(20, Math.round((streakDays / 90) * 20))

  const total = dsaScore + coreScore + projectScore + consistencyScore

  return {
    total,
    breakdown: {
      dsa: { score: dsaScore, max: 40, label: 'DSA Progress' },
      core: { score: coreScore, max: 20, label: 'Core Subjects' },
      projects: { score: projectScore, max: 20, label: 'Projects' },
      consistency: { score: consistencyScore, max: 20, label: 'Consistency' },
    },
  }
}

export function getReadinessLabel(score) {
  if (score >= 80) return { label: 'Interview Ready', color: 'text-green-pp' }
  if (score >= 60) return { label: 'On Track', color: 'text-accent' }
  if (score >= 40) return { label: 'Building Up', color: 'text-amber-pp' }
  return { label: 'Getting Started', color: 'text-text-secondary' }
}

export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

export function calculateStreakFromLogs(logs) {
  // logs is array of { date, completionRate }
  // Returns current streak count
  if (!logs.length) return 0

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  let streak = 0
  let checkDate = new Date()
  checkDate.setHours(0, 0, 0, 0)

  for (const log of sorted) {
    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)
    const diffDays = Math.round((checkDate - logDate) / (1000 * 60 * 60 * 24))

    if (diffDays <= 1 && log.completionRate >= 0.6) {
      streak++
      checkDate = logDate
    } else {
      break
    }
  }

  return streak
}
