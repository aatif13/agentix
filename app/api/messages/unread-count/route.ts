import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'
import MessageThread from '@/models/MessageThread'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // 1. Find threads the user is a part of
    const threads = await MessageThread.find({
      $or: [
        { founderId: session.user.id },
        { investorId: session.user.id }
      ]
    }).select('threadId')
    const threadIds = threads.map(t => t.threadId)

    // 2. Count unread messages in those threads where sender is NOT the current user
    const count = await Message.countDocuments({
      threadId: { $in: threadIds },
      senderId: { $ne: session.user.id },
      isRead: false
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Unread count error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
