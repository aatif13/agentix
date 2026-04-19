import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import PitchRoom from '@/models/PitchRoom'
import { calculateReadinessScore } from '@/lib/calculateReadinessScore'

// GET — return all public pitch profiles for the investor dashboard
export async function GET() {
  try {
    await connectDB()

    const pitchesRaw = await PitchRoom.find({ isPublic: true })
      .select('-investorReport') // omit full report for list view
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()

    const pitches = await Promise.all(pitchesRaw.map(async (p: any) => {
      const { score, breakdown } = await calculateReadinessScore(p.userId.toString(), p)
      return { ...p, readinessScore: { score, breakdown } }
    }))

    return NextResponse.json({ pitches })
  } catch (error) {
    console.error('PitchRoom Public GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
