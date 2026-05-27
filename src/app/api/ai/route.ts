import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { prompt, tasks, project } = await req.json()
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an AI assistant for a developer project management tool. Project: ${project}. Tasks: ${tasks}. User request: ${prompt}. Be concise and helpful.`
        }]
      }]
    })
  })

  const data = await res.json()
  const response = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI'
  return NextResponse.json({ response })
}