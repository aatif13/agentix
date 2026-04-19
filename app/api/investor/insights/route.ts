import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { groq } from '@/lib/groq'

const SECTORS = [
  'SaaS', 'FinTech', 'HealthTech', 'EdTech', 'E-Commerce',
  'AI/ML', 'Climate Tech', 'Web3', 'Developer Tools', 'Consumer Apps',
]

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sector } = await req.json()
    if (!sector) {
      return NextResponse.json({ error: 'Sector required' }, { status: 400 })
    }

    const prompt = `You are a top-tier venture capital analyst. Provide a concise, data-driven market trend analysis for the ${sector} sector in 2025/2026.

Cover the following:
1. **Market Overview** – current market size, growth trajectory, and TAM
2. **Key Trends** – 3-4 emerging trends shaping this sector
3. **Top Opportunities** – where smart money is flowing and why
4. **Risk Factors** – headwinds, regulatory concerns, or saturation risks
5. **Investment Thesis** – one strong 2-sentence investment thesis for this sector

Be specific, use real metrics where possible, and write in a professional but direct tone. Keep the response under 400 words.`

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 600,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(encoder.encode(text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('Insights error:', error)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ sectors: SECTORS })
}
