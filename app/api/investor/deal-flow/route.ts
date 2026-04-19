import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import PitchRoom from '@/models/PitchRoom'
import User from '@/models/User'
import InvestorWatchlist from '@/models/InvestorWatchlist'
import { calculateReadinessScore } from '@/lib/calculateReadinessScore'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const industry = searchParams.get('industry') || ''
    const sort = searchParams.get('sort') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 12

    await connectDB()

    const filter: Record<string, unknown> = { isPublic: true }
    if (industry && industry !== 'all') filter.industry = industry

    // We no longer have score, so we just sort by new or maybe fundingAsk if we wanted, but sticking to newest
    const sortOption: [string, 1 | -1][] = [['createdAt', -1]]

    const [pitches, total, watchlistItems] = await Promise.all([
      PitchRoom.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PitchRoom.countDocuments(filter),
      InvestorWatchlist.find({ investorId: session.user.id }).select('pitchId').lean(),
    ])

    const watchlistedIds = new Set(watchlistItems.map(w => w.pitchId.toString()))

    // Fetch founder info for each pitch
    const userIds = [...new Set(pitches.map(s => s.userId.toString()))]
    const founders = await User.find({ _id: { $in: userIds } }).select('name email avatar').lean()
    const founderMap = Object.fromEntries(founders.map(f => [f._id.toString(), f]))

    const enriched = await Promise.all(pitches.map(async (p: any) => {
      const { score, breakdown } = await calculateReadinessScore(p.userId.toString(), p)
      return {
        _id: p._id.toString(),
        startupName: p.startupName,
        tagline: p.tagline,
        industry: p.industry,
        stage: p.stage,
        targetMarket: p.targetMarket,
        fundingAsk: p.fundingAsk,
        traction: p.traction,
        createdAt: p.createdAt,
        founder: founderMap[p.userId.toString()] || null,
        isWatchlisted: watchlistedIds.has(p._id.toString()),
        readinessScore: { score, breakdown }
      }
    }))

    // Handle score sorting if requested
    if (sort === 'score') {
      enriched.sort((a, b) => (b.readinessScore?.score || 0) - (a.readinessScore?.score || 0))
    }

    return NextResponse.json({
      pitches: enriched,
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Deal flow error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
