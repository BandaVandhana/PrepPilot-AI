import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
  } = useAuth()

  const navigate = useNavigate()

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
        navigate('/dashboard')
      } else {
        await signUp(fullName, email, password)
        setError('Account created! Please check your email to verify.')
        setIsLogin(true)
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
      setError('Enter your email first.')
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
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>

          <p className="text-text-secondary mt-2">
            {isLogin
              ? 'Continue your preparation journey'
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
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-text-primary"
                required
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 text-text-primary"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-surface-hover border border-surface-border rounded-xl px-4 py-3 pr-10 text-text-primary"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>

            {isLogin && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-accent hover:underline"
              >
                Forgot Password?
              </button>
            )}

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
            className="w-full py-3 rounded-xl border border-surface-border bg-surface-hover text-text-primary"
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
                : "Already have an account? Sign In"}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}