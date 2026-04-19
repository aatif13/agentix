import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import InvestorProfile from '@/models/InvestorProfile'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    let profile = await InvestorProfile.findOne({ userId: session.user.id })

    if (!profile) {
      // Create empty profile if it doesn't exist
      profile = await InvestorProfile.create({ 
        userId: session.user.id,
        fullName: session.user.name || ''
      })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Investor Settings GET Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      fullName, photo, linkedIn, twitter, location, bio,
      firmName, investmentFocus, preferredStage, ticketSizeMin, ticketSizeMax, portfolio,
      notifications
    } = await req.json()

    await connectDB()
    const profile = await InvestorProfile.findOneAndUpdate(
      { userId: session.user.id },
      { 
        $set: {
          fullName, photo, linkedIn, twitter, location, bio,
          firmName, investmentFocus, preferredStage, ticketSizeMin, ticketSizeMax, portfolio,
          notifications
        }
      },
      { new: true, upsert: true }
    )

    return NextResponse.json({ profile, message: 'Settings updated successfully' })
  } catch (error) {
    console.error('Investor Settings PATCH Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
