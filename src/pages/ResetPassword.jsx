import { useState } from 'react'
import { supabase } from '../supabase/client'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdatePassword = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setMessage('')

      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      setMessage('Password updated successfully. You can now log in.')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="card p-8 w-full max-w-md">

        <h1 className="text-2xl font-semibold mb-6 text-text-primary">
          Reset Password
        </h1>

        {message && (
          <div className="mb-4 text-sm text-text-secondary">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">

          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-text-primary"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}