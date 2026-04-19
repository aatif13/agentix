import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import PitchRoom from '@/models/PitchRoom'
import InvestorWatchlist from '@/models/InvestorWatchlist'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const [pitchesViewed, watchlistCount, newThisWeek] = await Promise.all([
      PitchRoom.countDocuments({ 'viewedBy.investorId': session.user.id }),
      InvestorWatchlist.countDocuments({ investorId: session.user.id }),
      PitchRoom.countDocuments({ isPublic: true, createdAt: { $gte: weekAgo } }),
    ])

    return NextResponse.json({
      pitchesViewed,
      watchlistCount,
      newThisWeek,
    })
  } catch (error) {
    console.error('Investor stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
