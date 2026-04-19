import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import ProblemFinderResult from '@/models/ProblemFinderResult'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(session.user.id)
    if (!user || !user.selectedProblemId) {
      return NextResponse.json({ problem: null })
    }

    const result = await ProblemFinderResult.findById(user.selectedProblemId).lean()
    if (!result) {
      return NextResponse.json({ problem: null })
    }

    const problem = result.problems[user.selectedProblemIndex || 0]
    return NextResponse.json({ 
      problem: {
        ...problem,
        resultId: result._id,
        index: user.selectedProblemIndex || 0,
        domain: result.domain,
        subDomain: result.subDomain,
        location: result.location
      }
    })
  } catch (error) {
    console.error('GET selected-problem error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { problemId, index } = await req.json()
    if (!problemId) {
      return NextResponse.json({ error: 'Problem ID is required' }, { status: 400 })
    }

    await connectDB()
    await User.findByIdAndUpdate(session.user.id, {
      selectedProblemId: problemId,
      selectedProblemIndex: index || 0
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST selected-problem error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
