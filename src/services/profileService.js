import { supabase } from '../supabase/client'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function upsertProfile(userId, profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...profile }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDailyPlans(userId, limit = 7) {
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function saveDailyPlan(userId, date, tasks, planDay) {
  const { data, error } = await supabase
    .from('daily_plans')
    .upsert(
      {
        user_id: userId,
        date,
        tasks,
        plan_day: planDay,
      },
      {
        onConflict: 'user_id,date',
      }
    )
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getProgressLogs(userId, date) {
  const { data, error } = await supabase
    .from('progress_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)

  if (error) throw error
  return data || []
}

export async function upsertProgressLog(userId, taskName, completed, date) {
  const { data, error } = await supabase
    .from('progress_logs')
    .upsert(
      { user_id: userId, task_name: taskName, completed, date },
      { onConflict: 'user_id,task_name,date' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getStreak(userId) {
  const { data, error } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateStreak(userId, currentStreak, bestStreak) {
  const { data, error } = await supabase
    .from('streaks')
    .upsert(
      { user_id: userId, current_streak: currentStreak, best_streak: bestStreak },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTodayPlan(userId) {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (error) throw error

  return data
}

export async function getLastPlanDay(userId) {
  const { data, error } = await supabase
    .from('daily_plans')
    .select('plan_day')
    .eq('user_id', userId)
    .order('plan_day', { ascending: false })
    .limit(1)

  if (error) throw error

  return data?.[0]?.plan_day || 0
}