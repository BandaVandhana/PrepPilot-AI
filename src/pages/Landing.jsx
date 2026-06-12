import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const COMPANIES = ['Cisco', 'Google', 'Amazon', 'Microsoft', 'Optiver', 'Adobe', 'Flipkart', 'Atlassian']

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Personalized daily plan',
    body: 'Tell us your target company, available hours, and weak areas. Get a focused study plan — not a generic list.',
  },
  {
    icon: '💡',
    title: 'LeetCode by topic & company',
    body: '150+ curated problems filtered to your weak areas, tagged by company. No guessing what to practice.',
  },
  {
    icon: '🔥',
    title: 'Streak & progress tracking',
    body: 'Complete ≥ 60% of your daily tasks to keep your streak alive. One day at a time.',
  },
  {
    icon: '📊',
    title: 'Readiness score',
    body: 'A weighted score across DSA, core CS, projects, and consistency. Know exactly where you stand.',
  },
]

export default function Landing() {
  const { loading } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-surface grid-pattern">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-surface-border bg-surface/80 backdrop-blur-sm sticky top-0 z-10">
        {/* <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-white">P</div>
          <span className="font-semibold text-text-primary">PrepPilot AI</span>
        </div> */}
        <button onClick={() => navigate('/auth')} disabled={loading} className="btn-primary text-sm">
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-8 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-accent-glow border border-accent/20 text-accent text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-green-pp animate-pulse" />
          Free during placement season
        </div>

        <h1 className="text-5xl font-semibold text-text-primary leading-tight mb-5">
          Your AI placement
          <br />
          <span className="text-gradient">mentor, not a tutor</span>
        </h1>

        <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          PrepPilot builds your daily study plan, surfaces the right LeetCode problems, and tracks your
          readiness — so every hour you spend counts toward the offer you want.
        </p>

        <button
          onClick={() => navigate('/auth')}
          disabled={loading}
          className="btn-primary text-base px-8 py-3 glow-accent"
        >
          Start preparing →
        </button>

        {/* Company pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {COMPANIES.map(c => (
            <span key={c} className="text-xs text-text-muted border border-surface-border px-3 py-1.5 rounded-full">
              {c}
            </span>
          ))}
        </div>
        <p className="text-xs text-text-muted mt-3">Plans tailored for these companies and more</p>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {FEATURES.map(({ icon, title, body }) => (
            <div key={title} className="card p-6">
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="text-sm font-semibold text-text-primary mb-2">{title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="border-t border-surface-border py-16 text-center">
        <p className="text-text-secondary text-sm mb-4">No credit card. No setup. Just start preparing.</p>
        <button onClick={() => navigate('/auth')} disabled={loading} className="btn-primary">
          Create Free Account
        </button>
      </section>
    </div>
  )
}
