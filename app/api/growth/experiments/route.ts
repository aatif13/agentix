import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import GrowthExperiment from '@/models/GrowthExperiment'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const FALLBACK_EXPERIMENTS = {
  experiments: [
    { title: 'Cold DM 50 Target Users on Reddit', hypothesis: 'Direct organic outreach on hyper-niche subreddits will convert at 10% to beta signups.', channel: 'Reddit', expectedImpact: 'Low', effort: 'Low' },
    { title: 'Launch Free Side Tool', hypothesis: 'Building a micro-tool (like a generator) will capture organic SEO traffic and funnel leads to the main product.', channel: 'SEO', expectedImpact: 'Medium', effort: 'Medium' },
    { title: 'Create 3 LinkedIn Carousel Posts', hypothesis: 'Educational carousels perform best on LinkedIn algorithms currently, driving profile visits and link clicks.', channel: 'LinkedIn', expectedImpact: 'High', effort: 'Medium' },
    { title: 'Implement Invite-Only Referral Gate', hypothesis: 'Restricting access makes the product instantly more desirable and encourages users to share.', channel: 'Product', expectedImpact: 'Medium', effort: 'Medium' },
    { title: 'Setup automated welcome email with founder video', hypothesis: 'Personalization in the first 5 minutes of signup increases Day 7 retention by 15%.', channel: 'Email', expectedImpact: 'Low', effort: 'Low' },
    { title: 'Pitch 5 micro-influencers on YouTube', hypothesis: 'Offering a lifetime deal or small rev-share to 10k sub channels will result in high ROI targeted traffic.', channel: 'YouTube', expectedImpact: 'High', effort: 'High' }
  ]
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const experiments = await GrowthExperiment.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ experiments })
  } catch (error) {
    console.error('Experiments GET Error:', error)
    return NextResponse.json({ experiments: [] })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const { generateWithAI, singleExperiment, productContext: pCtx, goal: pGoal, title, hypothesis, channel, expectedImpact, effort, successMetric, testMethod, problemContext } = body

    if (generateWithAI) {
      const productContext = pCtx || (problemContext ? `${problemContext.title}: ${problemContext.reason}` : 'A B2B SaaS Startup')
      const goal = pGoal || (problemContext ? `Grow ${problemContext.title} in the ${problemContext.location?.district || 'local'} market.` : 'Get first users')

      // Single experiment generation
      if (singleExperiment && problemContext) {
        const sysPrompt = `You are a growth expert. Generate ONE lean startup growth experiment. Return ONLY valid JSON, no markdown.
{ "title": "string", "hypothesis": "string", "testMethod": "string", "successMetric": "string", "channel": "string", "expectedImpact": "Low/Medium/High", "effort": "Low/Medium/High" }`
        const uPrompt = `Generate a lean startup growth experiment for solving: "${problemContext.title}". Include: hypothesis, how to test it in 7 days (testMethod), success metric, and expected outcome.`
        let single
        try {
          const comp = await groq.chat.completions.create({ messages: [{ role: 'system', content: sysPrompt }, { role: 'user', content: uPrompt }], model: 'llama-3.3-70b-versatile', temperature: 0.5 })
          const clean = (comp.choices[0]?.message?.content || '{}').replace(/```json/gi, '').replace(/```/g, '').trim()
          single = JSON.parse(clean)
        } catch { single = { title: 'Test cold outreach on 20 potential users', hypothesis: 'Direct outreach will convert 10% to beta signups', testMethod: 'Send 20 personalised DMs over 7 days', successMetric: '2 beta signups', channel: 'Email', expectedImpact: 'Medium', effort: 'Low' } }
        const exp = await GrowthExperiment.create({ userId: session.user.id, title: single.title, hypothesis: single.hypothesis, testMethod: single.testMethod, successMetric: single.successMetric, channel: single.channel || 'Product', expectedImpact: single.expectedImpact || 'Medium', effort: single.effort || 'Medium', status: 'backlog', aiGenerated: true } as any)
        return NextResponse.json({ experiment: exp })
      }

      const systemPrompt = `You are a growth hacking expert. Generate 6 high-impact growth experiments for this startup. Return ONLY valid JSON, no markdown.

{ "experiments": [
  { "title": "string", "hypothesis": "string", "testMethod": "string", "successMetric": "string", "channel": "string", "expectedImpact": "Low/Medium/High", "effort": "Low/Medium/High" }
]}`

      const userPrompt = `Product context: ${productContext}\nGoal: ${goal}\n\n${problemContext ? `FOUNDATIONAL PROBLEM: ${problemContext.title}\n` : ''}Generate exactly 6 tactical, actionable growth experiments.`

      let result
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.6,
        })

        const content = completion.choices[0]?.message?.content || '{}'
        const clean = content.replace(/```json/gi, '').replace(/```/g, '').trim()
        result = JSON.parse(clean)
      } catch (e) {
         console.error('Groq parsing failed, using fallback.', e)
         result = FALLBACK_EXPERIMENTS
      }

      const exps = result.experiments.map((e: any) => ({
        userId: session.user.id,
        title: e.title,
        hypothesis: e.hypothesis,
        testMethod: e.testMethod || '',
        successMetric: e.successMetric || '',
        channel: e.channel,
        expectedImpact: e.expectedImpact,
        effort: e.effort,
        status: 'backlog',
        aiGenerated: true
      }))

      const inserted = await GrowthExperiment.insertMany(exps)
      return NextResponse.json({ experiments: inserted })
    } else {
      // Manual single creation
      const exp = await GrowthExperiment.create({
        userId: session.user.id,
        title,
        hypothesis,
        testMethod: testMethod || '',
        successMetric: successMetric || '',
        channel,
        expectedImpact,
        effort,
        status: 'backlog',
        aiGenerated: false
      } as any)
      return NextResponse.json({ experiment: exp })
    }
  } catch (error) {
    console.error('Experiment POST Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
