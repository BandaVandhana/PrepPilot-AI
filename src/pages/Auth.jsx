import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
  } = useAuth()

  const [isLogin, setIsLogin] = useState(true)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(fullName, email, password)
        setError('Account created successfully. Please check your email if verification is enabled.')
      }
    } catch (err) {
      const message = err?.message?.toLowerCase() || ''

      if (
        message.includes('already registered') ||
        message.includes('already exists') ||
        message.includes('user already')
      ) {
        setError('An account with this email already exists.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email first.')
      return
    }

    try {
      setError('')
      await resetPassword(email)
      setError('Password reset link sent to your email.')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-surface grid-pattern flex items-center justify-center px-6">

      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-text-primary">
            {isLogin ? 'Welcome Back' : 'Create your PrepPilot account'}
          </h1>

          <p className="text-text-secondary mt-2">
            {isLogin
              ? 'Continue your placement preparation journey'
              : 'Start preparing smarter with PrepPilot AI'}
          </p>
        </div>

        <div className="card p-8">

          {error && (
            <div className="mb-5 rounded-xl bg-red-dim border border-red-pp/20 text-red-pp text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {!isLogin && (
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 pr-12 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>

              {isLogin && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-accent hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading
                ? 'Please wait...'
                : isLogin
                ? 'Sign In'
                : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px flex-1 bg-surface-border" />
            <span className="text-xs text-text-muted">OR</span>
            <div className="h-px flex-1 bg-surface-border" />
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3 rounded-xl border border-surface-border bg-surface-hover text-text-primary hover:bg-surface transition"
          >
            Continue with Google
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setError('')
                setIsLogin(!isLogin)
              }}
              className="text-accent text-sm hover:underline"
            >
              {isLogin
                ? "Don't have an account? Create one"
                : 'Already have an account? Sign In'}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}