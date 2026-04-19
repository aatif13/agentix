import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import InvestorProfile from '@/models/InvestorProfile'
import Watchlist from '@/models/Watchlist'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await connectDB()

    // Fetch the investor profile
    // The ID provided is the userId
    const profile = await InvestorProfile.findOne({ userId: id }).lean()

    if (!profile) {
      return NextResponse.json({ error: 'Investor profile not found' }, { status: 404 })
    }

    // Fetch stats
    const watchlistCount = await Watchlist.countDocuments({ investorId: id })
    
    // Total Pitches Viewed - Using a reasonable placeholder for now as requested
    // In a real scenario, this would be a count from a PitchViews collection
    const pitchesViewedPlaceholder = 24 

    const publicProfile = {
      fullName: profile.fullName,
      photo: profile.photo,
      firmName: profile.firmName,
      location: profile.location,
      linkedIn: profile.linkedIn,
      twitter: profile.twitter,
      bio: profile.bio,
      investmentFocus: profile.investmentFocus,
      preferredStage: profile.preferredStage,
      ticketSizeMin: profile.ticketSizeMin,
      ticketSizeMax: profile.ticketSizeMax,
      portfolio: profile.portfolio,
      stats: {
        pitchesViewed: pitchesViewedPlaceholder,
        watchlistCount: watchlistCount
      }
    }

    return NextResponse.json({ profile: publicProfile })
  } catch (error) {
    console.error('Investor Profile API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
