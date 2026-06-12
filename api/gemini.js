export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const API_KEY = process.env.GEMINI_API_KEY

  console.log('KEY LENGTH:', API_KEY?.length)
  console.log('KEY START:', API_KEY?.slice(0, 5))
  console.log('BODY:', JSON.stringify(req.body))

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    }
  )

  const data = await response.json()
  console.log('GEMINI RESPONSE:', JSON.stringify(data))
  res.status(response.status).json(data)
}