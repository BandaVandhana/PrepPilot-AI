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

/* ---------------- GEMINI CALL WRAPPER ---------------- */
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
        temperature: 0.7,
        maxOutputTokens: 4096,
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
    console.log("FULL GEMINI RESPONSE:")
    console.log(data)

    console.log("RAW TEXT:")
    console.log(raw)

  console.log('RAW GEMINI RESPONSE:\n', raw)

  const parsed = extractJSON(raw)

  if (!parsed) {
    console.error('FAILED TO PARSE:', raw)
    throw new Error('Gemini returned invalid JSON')
  }

  return parsed
}

/* ---------------- DAILY PLAN ---------------- */
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