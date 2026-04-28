import { NextRequest } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { blueprint, problem, mode } = await req.json()

    if (!blueprint || !mode) {
      return new Response(JSON.stringify({ error: 'Missing blueprint or mode' }), { status: 400 })
    }

    const techStackStr = blueprint.techStack.map((t: any) => `${t.layer}: ${t.tool}`).join(', ')
    const apiRoutesCount = blueprint.apiRoutes.length
    const schemasCount = blueprint.schemas.length
    const schemaNames = blueprint.schemas.map((s: any) => s.name).join(', ')

    const systemPrompts: Record<string, string> = {
      spec: `You are an expert Product Manager and Architect. 
      Generate a comprehensive Product Requirements Document (PRD) for the following application blueprint.
      
      Problem Context: ${problem?.title ?? 'General web application'}
      Domain: ${problem?.domain ?? 'Technology'}
      Tech Stack: ${techStackStr}
      
      Format the output using these exact headers:
      ## 📋 Product Overview
      ## 🎯 Goals & Success Metrics
      ## 👤 User Personas
      ## ✅ MVP Feature List
      ## 🚫 Out Of Scope (V1)
      ## 📅 Suggested Build Timeline
      ## ⚠️ Key Technical Risks`,

      tasks: `You are a Lead Software Engineer and Project Manager. 
      Break down the MVP build of this application into a sprint-ready task list.
      
      Tech Stack: ${techStackStr}
      Schemas: ${schemaNames}
      API Routes: ${apiRoutesCount}
      
      Format the output using these exact headers:
      ## 🏃 Sprint 1 — Foundation (Week 1-2)
      ## 🔧 Sprint 2 — Core Features (Week 3-4)
      ## 🎨 Sprint 3 — Polish & Launch (Week 5-6)
      ## 🧪 Testing Checklist
      ## 🚀 Launch Checklist`,

      stack: `You are a Senior Solutions Architect. 
      Analyze the selected tech stack and provide deep architectural advice, potential pitfalls, and optimization strategies.
      
      Tech Stack: ${techStackStr}
      Application: ${problem?.title ?? 'Custom Application'}
      
      Format the output using these exact headers:
      ## ⚡ Stack Strengths
      ## ⚠️ Potential Bottlenecks
      ## 🔄 Alternative Options
      ## 💡 Hidden Costs To Watch
      ## 🏆 Our Recommendation`
    }

    const userMessage = `
      Tech Stack: ${techStackStr}
      API Routes Count: ${apiRoutesCount}
      Database Models: ${schemaNames}
      Problem: ${problem?.title ?? 'General web application'}
      Domain: ${problem?.domain ?? 'Technology'}
    `

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: 'system', content: systemPrompts[mode] },
        { role: 'user', content: userMessage }
      ],
      stream: true,
      max_tokens: 1400,
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
    console.error('Build Advisor Agent Error:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
