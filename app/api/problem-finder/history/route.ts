import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import ProblemFinderResult from '@/models/ProblemFinderResult'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const history = await ProblemFinderResult.find({ userId: session.user.id })
      .sort({ generatedAt: -1 })
      .limit(20)
      .lean()

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Problem Finder History Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    )
  }
}
