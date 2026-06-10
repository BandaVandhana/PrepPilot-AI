# PrepPilot AI — Your AI Placement Mentor

> Personalized daily study plans, LeetCode recommendations, progress tracking, and readiness scoring — built for Indian CS students preparing for placements.

## Features

- **AI daily roadmap** — Gemini generates a focused plan based on your target company, DSA level, and weak areas
- **LeetCode engine** — 150+ curated problems filtered by topic and tagged by company (no AI, no hallucinations)
- **Progress tracker** — checkbox tasks, daily completion, streak system (≥60% = streak day)
- **Readiness score** — weighted formula across DSA (40%), core CS (20%), projects (20%), consistency (20%)
- **AI insight** — Gemini explains your score and gives a specific next step

## Tech Stack

- React + Vite + Tailwind CSS
- Supabase (Auth + Postgres + Row Level Security)
- Gemini 1.5 Flash API
- Vercel (frontend hosting)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/PrepPilot-AI
cd PrepPilot-AI
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the contents of `supabase_schema.sql`
3. Go to **Authentication → Providers → Google** and enable Google OAuth
   - You'll need a Google Cloud project with OAuth 2.0 credentials
   - Add `https://YOUR_PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI

### 3. Get your API keys

- **Supabase**: Project Settings → API → Project URL and anon key
- **Gemini**: [aistudio.google.com](https://aistudio.google.com) → Get API Key (free)

### 4. Configure environment

```bash
cp .env.example .env
# Fill in your keys in .env
```

### 5. Run locally

```bash
npm run dev
```

### 6. Deploy to Vercel

```bash
npm install -g vercel
vercel
# Add your env vars in the Vercel dashboard
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Target company, DSA level, weak topics, stats |
| `daily_plans` | AI-generated task lists per date |
| `progress_logs` | Per-task completion checkboxes |
| `streaks` | Current and best streak counts |

## LeetCode Dataset

`src/data/` contains 150+ problems across:
Arrays · Strings · Trees · Graphs · DP · Heap · Linked List · Binary Search · Greedy · Backtracking

Each problem includes company tags so Cisco/Amazon/Google-relevant problems are surfaced first.

## Readiness Score Formula

```
DSA Progress      = min(40, (leetcodeSolved / 300) × 40)
Core Subjects     = min(20, (subjectsDone / 5) × 20)
Projects          = min(20, (projects / 3) × 20)
Consistency       = min(20, (streakDays / 90) × 20)
Total             = sum of above (max 100)
```

---

Built during placement prep. If you're using this to prepare for Cisco, Google, or Amazon — good luck. You've got this.
