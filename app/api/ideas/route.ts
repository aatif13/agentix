import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import IdeaValidation from '@/models/IdeaValidation'

function generateMockAnalysis(idea: string, industry: string) {
  const seed = idea.length + industry.length
  const validationScore = 55 + (seed % 40)
  const feasibilityScore = 60 + (seed % 35)
  const trendScore = 50 + (seed % 45)

  const competitionLevels: Array<'Low' | 'Medium' | 'High'> = ['Low', 'Medium', 'High']
  const competitionLevel = competitionLevels[seed % 3]

  const marketSizes = ['$2.1B', '$8.4B', '$15.7B', '$3.9B', '$22.3B', '$6.8B']
  const marketSize = marketSizes[seed % marketSizes.length]

  return {
    validationScore,
    feasibilityScore,
    trendScore,
    competitionLevel,
    marketSize,
    leanCanvas: {
      problem: `Current solutions lack AI integration and personalization, leaving users frustrated with manual, slow processes that don't scale for ${industry} businesses.`,
      solution: `An AI-powered platform that automates ${idea.split(' ').slice(0, 4).join(' ')} workflows, reducing manual effort by 70% and providing real-time insights.`,
      uvp: `The only ${industry} platform that combines AI automation with human oversight — 10x faster, 5x cheaper than existing solutions.`,
      channels: 'Product Hunt launch, LinkedIn B2B outreach, content marketing, strategic partnerships with accelerators, and freemium self-serve model.',
      customerSegments: `Early-stage startups (1-50 employees), growth-stage ${industry} companies, and solo founders looking to scale without hiring.`,
      revenueStreams: 'Monthly SaaS subscriptions ($29/$99/$499), usage-based API pricing, and enterprise custom contracts.',
      costStructure: 'Cloud infrastructure (AWS/GCP), AI API costs (OpenAI/Anthropic), team salaries, marketing spend, and customer support.',
      keyMetrics: 'MRR growth, CAC, LTV/CAC ratio, daily active users, feature adoption rate, and NPS score.',
      unfairAdvantage: `Proprietary training data from ${industry} domain, network effects from user community, and first-mover advantage in AI-native workflow automation.`,
    },
    competitors: [
      {
        name: 'Incumbent 1',
        funding: '$45M Series B',
        users: '12K',
        weakness: 'No AI features, expensive, poor UX',
      },
      {
        name: 'Legacy Player',
        funding: 'Bootstrapped',
        users: '8K',
        weakness: 'Outdated tech stack, slow iteration',
      },
      {
        name: 'New Entrant',
        funding: '$2M Seed',
        users: '1.2K',
        weakness: 'Narrow feature set, limited integrations',
      },
    ],
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const ideas = await IdeaValidation.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ ideas })
  } catch (error) {
    console.error('GET ideas error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ideaTitle, ideaDescription, industry, targetMarket } = await req.json()

    if (!ideaTitle || !ideaDescription || !industry) {
      return NextResponse.json({ error: 'Title, description and industry are required' }, { status: 400 })
    }

    await connectDB()

    const idea = await IdeaValidation.create({
      userId: session.user.id,
      ideaTitle,
      ideaDescription,
      industry,
      targetMarket: targetMarket || 'General Market',
      status: 'analyzing',
    })

    // Simulate async analysis after 2s
    setTimeout(async () => {
      try {
        const analysis = generateMockAnalysis(ideaDescription, industry)
        await IdeaValidation.findByIdAndUpdate(idea._id, {
          ...analysis,
          status: 'complete',
        })
      } catch (e) {
        console.error('Analysis simulation error:', e)
        await IdeaValidation.findByIdAndUpdate(idea._id, { status: 'complete', validationScore: 72 })
      }
    }, 2000)

    return NextResponse.json({ idea }, { status: 201 })
  } catch (error) {
    console.error('POST idea error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
