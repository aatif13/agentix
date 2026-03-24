import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import BuildProject from '@/models/BuildProject'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const FALLBACK_BLUEPRINT = {
  techStack: [
    { layer: "Frontend", emoji: "⚛️", tool: "Next.js", reason: "React framework for production", isFree: true },
    { layer: "Backend", emoji: "⚙️", tool: "Next.js API", reason: "Serverless functions", isFree: true },
    { layer: "Database", emoji: "🗄️", tool: "MongoDB", reason: "Flexible document database", isFree: true },
  ],
  schemas: [
    { name: "User", code: "const userSchema = new mongoose.Schema({\n  name: String,\n  email: String\n});" }
  ],
  apiRoutes: [
    { method: "GET" as const, endpoint: "/api/health", description: "Health check endpoint", authRequired: false }
  ],
  fileStructure: "📁 project-root\n├── 📁 app\n│   └── 📄 page.tsx\n└── 📄 package.json",
  costEstimate: {
    services: [
      { name: "Vercel", freeTier: "Hobby plan", paidStartsAt: "$20/mo", recommendation: "Start free" }
    ],
    monthlyTotal: { development: "$0", smallScale: "$0", mediumScale: "$20+" }
  },
  securityChecklist: {
    critical: [{ item: "CORS", description: "Configure allowed origins" }],
    important: [{ item: "Rate Limiting", description: "Add basic rate limiting" }],
    niceToHave: [{ item: "Audit Logs", description: "Track administrative actions" }]
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      projectName,
      description,
      appType,
      targetUsers,
      expectedUsers,
      teamSize,
      hasBudget,
      region,
      codingExperience,
      features
    } = body

    const systemPrompt = `You are a senior software architect and CTO advisor for early-stage startups. Generate a complete technical blueprint for the startup described. Return ONLY valid JSON with no markdown, no backticks, no explanation.
The JSON must have this exact structure:
{
  "techStack": [{ "layer": "string", "emoji": "string", "tool": "string", "reason": "string", "isFree": boolean }],
  "schemas": [{ "name": "string", "code": "string" }],
  "apiRoutes": [{ "method": "GET|POST|PUT|DELETE", "endpoint": "string", "description": "string", "authRequired": boolean }],
  "fileStructure": "string",
  "costEstimate": {
    "services": [{ "name": "string", "freeTier": "string", "paidStartsAt": "string", "recommendation": "string" }],
    "monthlyTotal": { "development": "string", "smallScale": "string", "mediumScale": "string" }
  },
  "securityChecklist": {
    "critical": [{ "item": "string", "description": "string" }],
    "important": [{ "item": "string", "description": "string" }],
    "niceToHave": [{ "item": "string", "description": "string" }]
  }
}`

    const userPrompt = `Generate a technical blueprint for:
Project: ${projectName}
Description: ${description}
App Type: ${appType}
Target Users: ${targetUsers}
Expected Users Year 1: ${expectedUsers}
Team Size: ${teamSize}
Budget Available: ${hasBudget ? 'Yes' : 'No'}
Region: ${region}
Coding Experience: ${codingExperience}
Required Features: ${(features || []).join(', ')}`

    let blueprint
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2, // Low temp for more deterministic JSON
      })

      const content = completion.choices[0]?.message?.content || '{}'
      // Try to parse out markdown formatting if occasionally present
      const cleanContent = content.replace(/```json/gi, '').replace(/```/g, '').trim()
      blueprint = JSON.parse(cleanContent)
    } catch (groqError) {
      console.error('Groq API Error or parsing failed:', groqError)
      blueprint = FALLBACK_BLUEPRINT
    }

    // Save to database
    await connectDB()
    const buildProject = await BuildProject.create({
      userId: session.user.id,
      projectName: projectName || 'Untitled Project',
      description: description || '',
      appType: appType || 'Web App',
      targetUsers: targetUsers || '',
      features: features || [],
      blueprint,
    })

    return NextResponse.json({
      blueprint,
      _id: buildProject._id
    })

  } catch (error) {
    console.error('API Error:', error)
    // Even if DB fails, return fallback so UI doesn't break
    return NextResponse.json({
      blueprint: FALLBACK_BLUEPRINT,
      _id: 'fallback-id' // Dummy ID for fallback
    })
  }
}
