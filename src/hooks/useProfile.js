import { useEffect, useState } from 'react'
import { supabase } from '../supabase/client'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!error) setProfile(data)

      setLoading(false)
    }

    fetchProfile()
  }, [user])

  return { profile, loading }
}