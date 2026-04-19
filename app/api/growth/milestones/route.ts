import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import Milestone from '@/models/Milestone'
import User from '@/models/User'
import ProblemFinderResult from '@/models/ProblemFinderResult'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// GET — all milestones for current user's selected problem
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const user = await User.findById(session.user.id).select('selectedProblemId').lean()
    const milestones = await Milestone.find({
      userId: session.user.id,
      ...(user?.selectedProblemId ? { problemId: user.selectedProblemId } : {}),
    }).sort({ targetDate: 1 }).lean()

    return NextResponse.json({ milestones })
  } catch (error) {
    console.error('Milestones GET error:', error)
    return NextResponse.json({ milestones: [] })
  }
}

// POST — create milestone(s) manually or via AI
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const body = await req.json()
    const { generateWithAI, title, description, targetDate, metrics } = body

    const user = await User.findById(session.user.id).select('selectedProblemId').lean()
    const problemId = user?.selectedProblemId || null

    if (generateWithAI) {
      // Fetch problem context
      let problemTitle = 'a startup'
      if (problemId) {
        const pfr = await ProblemFinderResult.findById(problemId).lean()
        if (pfr) {
          const idx = (user as any).selectedProblemIndex || 0
          const prob = pfr.problems?.[idx]
          if (prob) problemTitle = prob.title
        }
      }

      const systemPrompt = `You are a startup advisor. Return ONLY valid JSON, no markdown, no backticks.
{ "milestones": [
  { "title": "string", "description": "string", "daysFromNow": 30, "metrics": "string" }
]}`

      const userPrompt = `Suggest 5 key startup milestones for a founder solving: "${problemTitle}". For each milestone include: title, description, realistic daysFromNow (integer) from today, and success metrics.`

      let parsed: { milestones: Array<{ title: string; description: string; daysFromNow: number; metrics: string }> }
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.4,
        })
        const clean = (completion.choices[0]?.message?.content || '{}').replace(/```json/gi, '').replace(/```/g, '').trim()
        parsed = JSON.parse(clean)
      } catch {
        const today = new Date()
        parsed = {
          milestones: [
            { title: 'Problem Validation', description: 'Conduct 20+ user interviews to validate the core problem assumption with real data.', daysFromNow: 14, metrics: '20 interviews completed, problem confirmed by ≥70% of respondents' },
            { title: 'MVP Launch', description: 'Ship a functional minimum viable product with the core feature set.', daysFromNow: 45, metrics: 'MVP live, 10 beta users onboarded' },
            { title: 'First Paying Customer', description: 'Convert one beta user to a paying customer at any price point.', daysFromNow: 75, metrics: '$1 in revenue, signed agreement' },
            { title: 'Product-Market Fit Signal', description: 'Achieve ≥40% of users saying they would be "very disappointed" without the product.', daysFromNow: 120, metrics: 'Sean Ellis survey score ≥40%, 50 active users' },
            { title: 'Seed Funding Ready', description: 'Build the investor pitch deck, financial model, and Pitch Room profile.', daysFromNow: 150, metrics: 'Deck complete, 5 investor conversations started' },
          ],
        }
      }

      const now = new Date()
      const docs = parsed.milestones.map(m => ({
        userId: session.user.id,
        problemId,
        title: m.title,
        description: m.description,
        targetDate: new Date(now.getTime() + (m.daysFromNow || 30) * 24 * 60 * 60 * 1000),
        status: 'planned',
        metrics: m.metrics,
      }))

      const inserted = await Milestone.insertMany(docs)
      return NextResponse.json({ milestones: inserted })
    }

    // Manual single creation
    const milestone = await Milestone.create({
      userId: session.user.id,
      problemId,
      title,
      description,
      targetDate: new Date(targetDate),
      metrics,
      status: 'planned',
    })

    return NextResponse.json({ milestone })
  } catch (error) {
    console.error('Milestones POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
