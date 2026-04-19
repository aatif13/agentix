import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import InterestRequest from '@/models/InterestRequest'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startupId, message } = await req.json()
    if (!startupId) {
      return NextResponse.json({ error: 'startupId required' }, { status: 400 })
    }

    await connectDB()

    const existing = await InterestRequest.findOne({
      investorId: session.user.id,
      startupId,
    })

    if (existing) {
      return NextResponse.json({ error: 'You have already expressed interest in this startup' }, { status: 409 })
    }

    const interest = await InterestRequest.create({
      investorId: session.user.id,
      startupId,
      message: message || '',
      status: 'pending',
    })

    // ── NOTIFICATION ──
    const [pitch, investor, investorProfile] = await Promise.all([
      import('@/models/PitchRoom').then(m => m.default.findById(startupId)),
      import('@/models/User').then(m => m.default.findById(session.user.id)),
      import('@/models/InvestorProfile').then(m => m.default.findOne({ userId: session.user.id })),
    ])

    if (pitch && investor) {
      await import('@/models/Notification').then(async m => {
        await m.default.create({
          userId: pitch.userId,
          type: 'investor_interest',
          title: `${investorProfile?.fullName || investor.name || 'An investor'} is interested`,
          message: message || 'Expressed interest in your startup.',
          fromName: investorProfile?.fullName || investor.name,
          fromEmail: investor.email,
          firmName: investorProfile?.firmName,
          pitchId: startupId,
          isRead: false,
          status: 'pending'
        })
      })

      // Increment view count if interest is expressed (shows high engagement)
      await pitch.updateOne({ $inc: { viewCount: 1 } })
    }

    return NextResponse.json({ success: true, id: interest._id.toString() }, { status: 201 })
  } catch (error) {
    console.error('Interest request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const interests = await InterestRequest.find({ investorId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      interests: interests.map(i => ({
        ...i,
        _id: i._id.toString(),
        investorId: i.investorId.toString(),
        startupId: i.startupId.toString(),
      })),
    })
  } catch (error) {
    console.error('Interest list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
