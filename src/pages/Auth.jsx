import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
  } = useAuth()

  const [isLogin, setIsLogin] = useState(true)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to="/dashboard" replace />

  const handleSubmit = async e => {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')

      if (isLogin) {
        await signIn(email, password)
      } else {
        await signUp(fullName, email, password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="card p-8 w-full max-w-md">

        <h1 className="text-2xl font-semibold mb-6">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h1>

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="input"
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            required
          />

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isLogin
              ? 'Login'
              : 'Create Account'}
          </button>
        </form>

        <div className="my-5 text-center text-sm text-text-muted">
          OR
        </div>

        <button
          onClick={signInWithGoogle}
          className="btn-primary w-full"
        >
          Continue with Google
        </button>

        <button
          className="mt-5 text-sm text-accent"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : 'Already have an account? Login'}
        </button>

      </div>
    </div>
  )
}