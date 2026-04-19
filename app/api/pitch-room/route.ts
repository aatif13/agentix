import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import PitchRoom from '@/models/PitchRoom'
import InvestorWatchlist from '@/models/InvestorWatchlist'

// GET — fetch current user's pitch profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const pitch = await PitchRoom.findOne({ userId: session.user.id }).lean()
    
    let watchlistCount = 0
    if (pitch) {
      watchlistCount = await InvestorWatchlist.countDocuments({ pitchId: pitch._id })
    }

    return NextResponse.json({ 
      pitch: pitch || null,
      stats: {
        watchlistCount
      }
    })
  } catch (error) {
    console.error('PitchRoom GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST — create or update user's pitch profile (upsert)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()

    const {
      selectedProblemId,
      startupName,
      tagline,
      stage,
      industry,
      targetMarket,
      problemStatement,
      solution,
      uniqueValueProposition,
      businessModel,
      traction,
      teamDetails,
      fundingAsk,
      useOfFunds,
      founderEmail,
      investorReport,
      isPublic,
    } = body

    const updateData = {
      ...(selectedProblemId !== undefined && { selectedProblemId }),
      ...(startupName !== undefined && { startupName }),
      ...(tagline !== undefined && { tagline }),
      ...(stage !== undefined && { stage }),
      ...(industry !== undefined && { industry }),
      ...(targetMarket !== undefined && { targetMarket }),
      ...(problemStatement !== undefined && { problemStatement }),
      ...(solution !== undefined && { solution }),
      ...(uniqueValueProposition !== undefined && { uniqueValueProposition }),
      ...(businessModel !== undefined && { businessModel }),
      ...(traction !== undefined && { traction }),
      ...(teamDetails !== undefined && { teamDetails }),
      ...(fundingAsk !== undefined && { fundingAsk }),
      ...(useOfFunds !== undefined && { useOfFunds }),
      ...(founderEmail !== undefined && { founderEmail }),
      ...(investorReport !== undefined && { investorReport }),
      ...(isPublic !== undefined && { isPublic }),
    }

    // ── NOTIFICATION LOGIC ──
    const beforePitch = await PitchRoom.findOne({ userId: session.user.id }).lean()

    const pitch = await PitchRoom.findOneAndUpdate(
      { userId: session.user.id },
      { $set: updateData },
      { upsert: true, new: true, runValidators: true }
    )

    if (pitch && pitch.isPublic) {
      const isNewlyPublic = !beforePitch?.isPublic
      const keyFieldsChanged = beforePitch && (
        beforePitch.startupName !== pitch.startupName ||
        beforePitch.tagline !== pitch.tagline ||
        beforePitch.industry !== pitch.industry ||
        beforePitch.investorReport !== pitch.investorReport
      )

      // Notify Match
      if (isNewlyPublic) {
        import('@/models/InvestorProfile').then(async m => {
          const matchedInvestors = await m.default.find({ 
            investmentFocus: pitch.industry 
          }).select('userId').lean()

          if (matchedInvestors.length > 0) {
            import('@/models/Notification').then(async n => {
              const notifs = matchedInvestors.map(inv => ({
                userId: inv.userId,
                type: 'startup_match',
                title: 'New Startup Match',
                message: `${pitch.startupName} (in ${pitch.industry}) was just published. Matches your focus.`,
                pitchId: pitch._id,
                isRead: false
              }))
              await n.default.insertMany(notifs)
            })
          }
        })
      } 
      // Notify Update to Watchers
      else if (keyFieldsChanged) {
        import('@/models/InvestorWatchlist').then(async m => {
          const watchers = await m.default.find({ pitchId: pitch._id }).select('investorId').lean()
          if (watchers.length > 0) {
            import('@/models/Notification').then(async n => {
              const notifs = watchers.map(w => ({
                userId: w.investorId,
                type: 'startup_update',
                title: 'Watchlist Update',
                message: `${pitch.startupName} has updated their pitch details.`,
                pitchId: pitch._id,
                isRead: false
              }))
              await n.default.insertMany(notifs)
            })
          }
        })
      }
    }

    return NextResponse.json({ pitch, success: true })
  } catch (error) {
    console.error('PitchRoom POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
