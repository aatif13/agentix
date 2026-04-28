import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { problem, location, domain, subDomain, mode } = await req.json()

    if (problem == null) return NextResponse.json({ error: 'Missing: problem' }, { status: 400 })
    if (location == null) return NextResponse.json({ error: 'Missing: location' }, { status: 400 })
    if (!domain) return NextResponse.json({ error: 'Missing: domain' }, { status: 400 })
    if (!subDomain) return NextResponse.json({ error: 'Missing: subDomain' }, { status: 400 })
    if (!mode) return NextResponse.json({ error: 'Missing: mode' }, { status: 400 })

    const { title, affectedGroup, reason, startupOpportunity, monetization } = problem
    const { country, state, district, region } = location

    const systemPrompts: Record<string, string> = {
      market: `You are an expert Market Researcher for the Agentix platform. 
      Your goal is to deeply research the market potential of a specific problem in a specific location.
      Location: ${district}, ${state}, ${country} (${region})
      Domain: ${domain} > ${subDomain}

      Focus on market size, existing players (competitors), gaps, and timing. 
      Be hyper-local and specific to the mentioned location.
      
      Format your output using these exact headers:
      ## 📊 Market Overview
      ## 🏢 Existing Solutions & Players
      ## 🕳️ Gaps In The Market
      ## ⏰ Why Now
      ## 💰 Market Size Estimate
      ## 🎯 Best Startup Angle`,

      validate: `You are a Startup Validation Expert for the Agentix platform.
      Your goal is to determine if a specific problem is worth building a startup around.
      Location: ${district}, ${state}, ${country} (${region})
      Domain: ${domain} > ${subDomain}

      Analyze if the problem is real, painful, and if people are willing to pay for a solution.
      
      Format your output using these exact headers:
      ## ✅ Problem Validity Score: X/10
      ## 🔥 Pain Level Assessment
      ## 👥 Who Suffers Most
      ## 📈 Willingness To Pay Signals
      ## ⚠️ Red Flags
      ## 💡 Validation Verdict`,

      ideas: `You are a Creative Startup Architect for the Agentix platform.
      Your goal is to generate 5 innovative startup ideas that solve this exact problem in this exact location.
      Location: ${district}, ${state}, ${country} (${region})
      Domain: ${domain} > ${subDomain}

      Ideas must be hyper-local, feasible, and high-impact.
      
      For each idea, format your output using these exact headers:
      ## 💡 Idea 1: [Name]
      - What it does
      - Target customer
      - Revenue model
      - Why it works here (location-specific)
      - Unfair advantage angle
      (and so on for Idea 2 through Idea 5)`
    }

    const userMessage = `
      Problem Title: ${title}
      Affected Group: ${affectedGroup}
      Why It Exists: ${reason}
      Location: ${district}, ${state}, ${country} (${region})
      Domain: ${domain} > ${subDomain}
      Startup Opportunity: ${startupOpportunity}
      Monetization: ${monetization}
    `

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompts[mode] },
        { role: 'user', content: userMessage }
      ],
      stream: true,
      max_tokens: 1200,
      temperature: 0.7,
    })

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(`data: ${JSON.stringify({ text: content })}\n\n`)
          }
        }
        controller.enqueue('data: [DONE]\n\n')
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Problem Researcher API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
