const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

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
async function callGemini(prompt, maxTokens = 4096) {
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
        maxOutputTokens: maxTokens,
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
  const prompt = `
You are PrepPilot AI.

Generate a personalized placement preparation plan.

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
- Use ONLY task types:
  - dsa
  - concept
  - mcq
  - revision
- DSA tasks must include lcNumber and lcUrl.
- Non-DSA tasks must NOT include lcNumber or lcUrl.
- Include at least one DSA task.
- Include one OS/DBMS/CN concept task.
- Keep descriptions short.
- Return JSON only.
- No markdown.
- No explanation.

Student Profile:
${JSON.stringify(profile, null, 2)}
`

  return await callGemini(prompt, 4096)
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