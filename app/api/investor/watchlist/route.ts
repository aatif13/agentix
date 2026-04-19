import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import InvestorWatchlist from '@/models/InvestorWatchlist'
import PitchRoom from '@/models/PitchRoom'
import User from '@/models/User'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Fetch all watchlisted pitches for this investor
    const watchlistItems = await InvestorWatchlist.find({ investorId: session.user.id })
      .sort({ savedAt: -1 })
      .lean()

    if (watchlistItems.length === 0) {
      return NextResponse.json({ pitches: [] })
    }

    const pitchIds = watchlistItems.map(w => w.pitchId)
    const pitches = await PitchRoom.find({ _id: { $in: pitchIds } }).lean()

    // Fetch founder info for each pitch
    const userIds = [...new Set(pitches.map(p => p.userId.toString()))]
    const founders = await User.find({ _id: { $in: userIds } }).select('name email avatar').lean()
    const founderMap = Object.fromEntries(founders.map(f => [f._id.toString(), f]))

    const enriched = pitches.map(p => ({
      ...p,
      _id: p._id.toString(),
      founder: founderMap[p.userId.toString()] || null,
      isWatchlisted: true,
      savedAt: watchlistItems.find(w => w.pitchId.toString() === p._id.toString())?.savedAt,
    }))

    return NextResponse.json({ pitches: enriched })
  } catch (error) {
    console.error('Watchlist GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pitchId } = await req.json()
    if (!pitchId) {
      return NextResponse.json({ error: 'pitchId required' }, { status: 400 })
    }

    await connectDB()

    await InvestorWatchlist.findOneAndUpdate(
      { investorId: session.user.id, pitchId },
      { investorId: session.user.id, pitchId, savedAt: new Date() },
      { upsert: true }
    )

    return NextResponse.json({ success: true, message: 'Added to watchlist' })
  } catch (error) {
    console.error('Watchlist POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pitchId } = await req.json()
    if (!pitchId) {
      return NextResponse.json({ error: 'pitchId required' }, { status: 400 })
    }

    await connectDB()

    const result = await InvestorWatchlist.findOneAndDelete({ 
      investorId: session.user.id, 
      pitchId 
    })

    if (!result) {
      return NextResponse.json({ error: 'Item not found in watchlist' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Removed from watchlist' })
  } catch (error) {
    console.error('Watchlist DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
