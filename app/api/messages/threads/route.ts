import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import MessageThread from '@/models/MessageThread'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Find all threads where user is either founder or investor and status is accepted
    const threads = await MessageThread.find({
      $or: [
        { founderId: session.user.id },
        { investorId: session.user.id }
      ],
      status: 'accepted'
    }).sort({ lastMessageAt: -1 })

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Fetch threads error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
