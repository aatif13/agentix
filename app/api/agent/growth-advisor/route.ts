import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { planMeta, problem, mode } = await req.json()

    if (!planMeta || !mode) {
      return new Response(JSON.stringify({ error: 'Missing: planMeta or mode' }), { status: 400 })
    }

    const { productName, growthGoal, channels } = planMeta
    const channelStr = Array.isArray(channels) ? channels.join(', ') : ''
    
    const context = `
      Product: ${productName}
      Growth Goal: ${growthGoal}
      Selected Channels: ${channelStr}
      Problem being solved: ${problem?.title ?? 'General startup'}
      Target audience: ${problem?.affectedGroup ?? 'General users'}
      Location: ${problem?.location ? `${problem.location.district}, ${problem.location.state}, ${problem.location.country}` : 'Not specified'}
    `

    const systemPrompts: Record<string, string> = {
      channels: `You are an expert Growth Strategist for the Agentix platform. 
      Analyze the selected growth channels and give deep tactical advice.
      Context: ${context}

      Format your output using these exact headers:
      ## 📣 Channel Analysis
      ## 🏆 Your Strongest Channel
      ## ⚠️ Channels To Avoid Wasting Time On
      ## 📅 Posting Frequency Guide
      ## 💡 Platform-Specific Tactics
      ## 🎯 90-Day Channel Roadmap`,

      copy: `You are a High-Conversion Copywriter for the Agentix platform.
      Generate high-converting copy assets for this startup.
      Context: ${context}

      Format your output using these exact headers:
      ## 🎯 Hero Headline (5 variations)
      ## 📧 Cold Email Subject Lines (10 variations)
      ## 🐦 Twitter/X Bio
      ## 💼 LinkedIn Summary
      ## 📝 One-Liner Pitch
      ## 🔥 Reddit Post Hook
      ## 📣 ProductHunt Tagline (5 variations)`,

      experiments: `You are a Growth Hacker and Experimentation Expert for the Agentix platform.
      Generate a prioritized list of 5 growth experiments to run now.
      Context: ${context}

      For each experiment, include:
      - Hypothesis
      - How to run it
      - Success metric
      - Time to results
      - Effort: Low/Medium/High

      Format your output using these exact headers:
      ## 🧪 Experiment 1: [Name]
      ## 🧪 Experiment 2: [Name]
      ## 🧪 Experiment 3: [Name]
      ## 🧪 Experiment 4: [Name]
      ## 🧪 Experiment 5: [Name]
      ## 📊 Priority Order
      ## ⚡ Quick Win To Run This Week`,

      retention: `You are a Retention and Lifecycle Marketing Expert for the Agentix platform.
      Generate a retention and engagement strategy to keep users and reduce churn.
      Context: ${context}

      Format your output using these exact headers:
      ## 🔄 Retention Overview
      ## 📉 Biggest Churn Risks
      ## 💌 Engagement Touchpoints
      ## 🎁 Loyalty & Reward Ideas
      ## 📊 Retention Metrics To Track
      ## 🚀 30-Day Retention Sprint`
    }

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompts[mode] },
        { 
          role: 'user', 
          content: `
            Product Name: ${productName}
            Growth Goal: ${growthGoal}
            Channels: ${channelStr}
            Problem: ${problem?.title ?? 'General startup growth'}
            Audience: ${problem?.affectedGroup ?? 'General users'}
          ` 
        }
      ],
      stream: true,
      max_tokens: 1400,
      temperature: 0.75,
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
    console.error('Growth Advisor API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
