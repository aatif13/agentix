import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import PitchRoom from '@/models/PitchRoom'
import InvestorWatchlist from '@/models/InvestorWatchlist'
import Notification from '@/models/Notification'
import User from '@/models/User'
import InvestorProfile from '@/models/InvestorProfile'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const pitch = await PitchRoom.findOne({ userId: session.user.id }).lean()
    if (!pitch) {
      return NextResponse.json({ 
        viewCount: 0, 
        watchlistCount: 0, 
        interestCount: 0, 
        recentActivity: [] 
      })
    }

    const pitchId = pitch._id

    // 1. Aggregation counts
    const [watchlistCount, interestCount] = await Promise.all([
      InvestorWatchlist.countDocuments({ pitchId }),
      Notification.countDocuments({ userId: session.user.id, type: 'investor_interest', pitchId: pitchId })
    ])

    // 2. Recent Viewers processing
    // Grab the last 5 viewers
    const recentViews = (pitch.viewedBy || []).slice(-5).reverse()
    
    const populatedActivity = await Promise.all(recentViews.map(async (v: any) => {
      const [u, ip] = await Promise.all([
        User.findById(v.investorId).select('name').lean(),
        InvestorProfile.findOne({ userId: v.investorId }).select('firmName fullName').lean()
      ])

      return {
        type: 'view',
        investorName: ip?.fullName || u?.name || 'Anonymous Investor',
        firmName: ip?.firmName || 'Private Investor',
        timestamp: v.viewedAt
      }
    }))

    // 3. Recent Interest Notifications
    const recentInterests = await Notification.find({ 
      userId: session.user.id, 
      type: 'investor_interest', 
      pitchId: pitchId 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

    const interestActivity = recentInterests.map(n => ({
      type: 'interest',
      investorName: n.fromName || 'Someone',
      firmName: 'Interested Investor', // firmName might not be in notification, we could lookup if needed
      timestamp: n.createdAt,
      message: n.message
    }))

    // Combine and sort
    const allActivity = [...populatedActivity, ...interestActivity]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)

    return NextResponse.json({
      viewCount: pitch.viewCount || 0,
      watchlistCount,
      interestCount,
      recentActivity: allActivity
    })

  } catch (error) {
    console.error('Pitch stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
