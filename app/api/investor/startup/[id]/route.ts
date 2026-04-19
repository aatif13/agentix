import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import PitchRoom from '@/models/PitchRoom'
import User from '@/models/User'
import InvestorWatchlist from '@/models/InvestorWatchlist'
import InvestorProfile from '@/models/InvestorProfile'
import InterestRequest from '@/models/InterestRequest'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    // 1. Fetch Pitch and update views (Atomic increment and conditional set)
    const pitch = await PitchRoom.findOneAndUpdate(
      { _id: id, isPublic: true },
      { 
        $inc: { viewCount: 1 },
        $addToSet: { 
          viewedBy: { 
            investorId: session.user.id, 
            viewedAt: new Date() 
          } 
        } 
      },
      { new: true }
    ).lean()

    if (!pitch) {
      return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
    }

    // 2. Fetch founder, watchlist state, interest state, and CURRENT INVESTOR info
    const [founder, watchlistEntry, interestEntry, investorProfile] = await Promise.all([
      User.findById(pitch.userId).select('name email avatar').lean(),
      InvestorWatchlist.findOne({ investorId: session.user.id, pitchId: id }),
      InterestRequest.findOne({ investorId: session.user.id, startupId: id }), // Kept for now, assuming interest is linked to startupId/pitchId interchangeably
      InvestorProfile.findOne({ userId: session.user.id }).lean(),
    ])

    return NextResponse.json({
      ...pitch,
      _id: pitch._id.toString(),
      userId: pitch.userId.toString(),
      founder,
      isWatchlisted: !!watchlistEntry,
      hasExpressedInterest: !!interestEntry,
      interestStatus: interestEntry?.status || null,
      viewerProfile: investorProfile ? {
        name: investorProfile.fullName || session.user.name,
        firm: investorProfile.firmName,
        photo: investorProfile.photo
      } : null
    })
  } catch (error) {
    console.error('Pitch detail error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
