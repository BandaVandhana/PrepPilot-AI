import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../supabase/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    })

    if (error) throw error
  }

  const signUp = async (fullName, email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) throw error

  const user = data?.user ?? data?.session?.user

  // 1️⃣ CREATE PROFILE
  if (user) {
    await supabase.from('profiles').insert([
      {
        user_id: user.id,
        target_company: 'Cisco',
        year: '3rd Year',
        dsa_level: 'Intermediate',
        daily_hours: 3,
        weak_topics: [],
        leetcode_solved: 0,
        core_subjects_completed: 0,
        projects: 0,
      },
    ])

    // 2️⃣ CREATE STREAK (🔥 THIS IS WHAT I TOLD YOU TO ADD)
    await supabase.from('streaks').insert([
      {
        user_id: user.id,
        current_streak: 0,
        best_streak: 0,
        last_updated: new Date().toISOString(),
      },
    ])
  }
}

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const resetPassword = async (email) => {
    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            window.location.origin +
            '/reset-password',
        }
      )

    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) throw error
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)

  if (!ctx) {
    throw new Error(
      'useAuth must be used inside AuthProvider'
    )
  }

  return ctx
}