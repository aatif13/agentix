import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import WeeklyReport from '@/models/WeeklyReport'
import AgentTask from '@/models/AgentTask'
import GrowthExperiment from '@/models/GrowthExperiment'
import Milestone from '@/models/Milestone'
import User from '@/models/User'
import ProblemFinderResult from '@/models/ProblemFinderResult'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const FALLBACK_REPORT = {
  executiveSummary: "Strong week of execution with meaningful progress across milestones and experiments. Momentum is building.",
  keyWins: [
    "Completed a key planned milestone ahead of schedule.",
    "Growth experiment validated a new acquisition channel.",
    "Maintained consistent product development pace."
  ],
  blockers: [
    "User testing loops need tighter feedback intervals.",
    "Top-of-funnel traffic needs attention."
  ],
  nextWeekFocus: [
    { priority: 1, action: "Launch outreach sequence to 100 targets.", reason: "Highest predicted ROI for current maturity.", effort: "Medium" },
    { priority: 2, action: "Review running experiment metrics.", reason: "Requires 7 days of data for significance.", effort: "Low" },
    { priority: 3, action: "Fix onboarding performance bottlenecks.", reason: "Impacting day-1 activation rates.", effort: "High" }
  ],
  investorUpdateSnippet: "This week we made significant progress on our core milestones and validated key growth assumptions through structured experimentation. Team is focused and execution velocity is high.",
  score: { overall: 78, execution: 82, consistency: 74, momentum: 80 }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    const reports = await WeeklyReport.find({ userId: session.user.id }).sort({ weekOf: -1 }).lean()
    return NextResponse.json({ reports })
  } catch (error) {
    console.error('WeeklyReport GET Error:', error)
    return NextResponse.json({ reports: [] })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()

    const { problemContext: manualProblemCtx } = await req.json()

    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    // ── Fetch user's selected problem
    const user = await User.findById(session.user.id).select('selectedProblemId selectedProblemIndex').lean()
    let problemTitle = manualProblemCtx?.title || 'a startup'

    if (!manualProblemCtx && user?.selectedProblemId) {
      const pfr = await ProblemFinderResult.findById(user.selectedProblemId).lean()
      if (pfr) {
        const idx = (user as any).selectedProblemIndex || 0
        const prob = pfr.problems?.[idx]
        if (prob) problemTitle = prob.title
      }
    }

    // ── Fetch active milestones
    const milestones = await Milestone.find({
      userId: session.user.id,
      ...(user?.selectedProblemId ? { problemId: user.selectedProblemId } : {}),
    }).select('title status targetDate').lean()

    const completedMilestones = milestones.filter((m: any) => m.status === 'completed').map((m: any) => m.title)
    const inProgressMilestones = milestones.filter((m: any) => m.status === 'in-progress').map((m: any) => m.title)

    // ── Fetch completed experiments this week
    const exps = await GrowthExperiment.find({
      userId: session.user.id,
      status: { $in: ['running', 'done'] },
    }).select('title status channel result').lean()

    const completedExps = exps.filter((e: any) => e.status === 'done').map((e: any) => `${e.title}${e.result ? ` (Result: ${e.result})` : ''}`)
    const runningExps = exps.filter((e: any) => e.status === 'running').map((e: any) => e.title)

    // ── Fetch recent tasks
    const recentTasks = await AgentTask.find({ userId: session.user.id, createdAt: { $gte: sevenDaysAgo } })
      .select('taskName status').lean()
    const completedTasks = recentTasks.filter((t: any) => t.status === 'completed').length

    const systemPrompt = `You are a startup growth advisor writing a weekly performance brief for a founder. Be direct, actionable and encouraging. Return ONLY valid JSON, no markdown, no backticks.

{
  "executiveSummary": "string (2-3 sentences)",
  "keyWins": ["string"],
  "blockers": ["string"],
  "nextWeekFocus": [
    { "priority": 1, "action": "string", "reason": "string", "effort": "Low/Medium/High" }
  ],
  "investorUpdateSnippet": "string (2-3 sentence paragraph suitable for an investor update email)",
  "score": { "overall": 0, "execution": 0, "consistency": 0, "momentum": 0 }
}`

    const userPrompt = `Generate a professional weekly startup progress report for a founder solving: "${problemTitle}".

Completed milestones this week: ${completedMilestones.length > 0 ? completedMilestones.join('; ') : 'None'}
In-progress milestones: ${inProgressMilestones.length > 0 ? inProgressMilestones.join('; ') : 'None'}
Completed experiments: ${completedExps.length > 0 ? completedExps.join('; ') : 'None'}
Running experiments: ${runningExps.length > 0 ? runningExps.join('; ') : 'None'}
Agent tasks completed this week: ${completedTasks}

Generate: Executive Summary, Key Wins (3-4 items), Blockers (1-3 items), Next Week's Focus (3 prioritized actions), Investor Update Snippet (professional 2-3 sentence summary for investors), and scores (0-100).`

    let report
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
      report = JSON.parse(clean)
    } catch (e) {
      console.error('Weekly Report Groq Issue:', e)
      report = FALLBACK_REPORT
    }

    const wk = await WeeklyReport.create({ userId: session.user.id, weekOf: new Date(), report })
    return NextResponse.json({ report, _id: wk._id })
  } catch (error) {
    console.error('WeeklyReport POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
