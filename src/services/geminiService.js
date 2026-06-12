
// const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const GEMINI_URL = `/api/gemini`

/* ---------------- SAFE JSON PARSER ---------------- */
function extractJson(text) {
  if (!text) return null

  const cleaned = text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {}

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')

  if (start !== -1 && end !== -1) {
    try {
      return JSON.parse(cleaned.slice(start, end + 1))
    } catch {}
  }

  return null
}

/* ---------------- GEMINI CALL ---------------- */
async function callGemini(prompt, maxTokens = 1024) {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('Gemini API Error:', data)
    throw new Error(data?.error?.message || 'Gemini API error')
  }

  const raw =
    data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

  console.log('FULL GEMINI RESPONSE:', data)
  console.log('RAW GEMINI RESPONSE:', raw)

  const parsed = extractJson(raw)

  if (!parsed) {
    console.error('FAILED TO PARSE:', raw)
    throw new Error('Gemini returned invalid JSON')
  }

  return parsed
}

/* ---------------- DAILY PLAN ---------------- */
export async function generateDailyPlan(profile) {
  const {
    currentDay = 1,
    targetCompany,
    dsaLevel,
    dailyHours,
    weakTopics,
  } = profile
  const prompt = `
You are PrepPilot AI.

Generate a personalized placement preparation plan.

This is Day ${currentDay} of the student's preparation journey.

Return ONLY valid JSON.

Schema:

{
  "greeting": "one motivational sentence",
  "tasks": [
    {
      "id": "t1",
      "type": "dsa",
      "title": "problem or topic name",
      "description": "short description",
      "duration": 45,
      "lcNumber": 207,
      "lcUrl": "https://leetcode.com/problems/course-schedule/"
    }
  ]
}

Rules:

- Return EXACTLY 3 tasks.
- Use ONLY:
  - dsa
  - concept
  - mcq
  - revision

- Include at least:
  - 1 DSA task
  - 1 OS/DBMS/CN concept task

- DSA tasks MUST contain:
  - lcNumber
  - lcUrl

- Non-DSA tasks MUST NOT contain:
  - lcNumber
  - lcUrl

- Increase difficulty gradually as the day number increases.
- Avoid repeating the same LeetCode questions.
- If Day <= 7:
  Focus on fundamentals.
- If Day 8-20:
  Focus on medium-level interview preparation.
- If Day > 20:
  Focus on company-style interview questions and revision.

Student Profile:

${JSON.stringify(profile, null, 2)}

Return JSON only.
No markdown.
No explanation.
`
return await callGemini(prompt, 1024)
}

/* ---------------- READINESS EXPLANATION ---------------- */
export async function generateReadinessExplanation(metrics) {
  const prompt = `
You are PrepPilot AI.

Analyze placement readiness.

Return ONLY valid JSON.

{
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2"
  ],
  "nextStep": "one actionable recommendation"
}

Metrics:
${JSON.stringify(metrics, null, 2)}

Return JSON only.
`

  return await callGemini(prompt, 1024)
}