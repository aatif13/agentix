import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Message from '@/models/Message'
import MessageThread from '@/models/MessageThread'
import Notification from '@/models/Notification'
import mongoose from 'mongoose'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = await params  // ← added await

    await connectDB()

    const thread = await MessageThread.findOne({ threadId })
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Ensure the user is part of the thread
    if (thread.founderId.toString() !== session.user.id && thread.investorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Fetch messages
    const messages = await Message.find({ threadId }).sort({ createdAt: 1 })

    // Mark messages as read for the current user
    await Message.updateMany(
      { threadId, senderId: { $ne: session.user.id }, isRead: false },
      { $set: { isRead: true } }
    )

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Fetch messages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = await params  // ← added await
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    await connectDB()

    const thread = await MessageThread.findOne({ threadId })
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const isFounder = thread.founderId.toString() === session.user.id
    const isInvestor = thread.investorId.toString() === session.user.id

    if (!isFounder && !isInvestor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const senderRole = isFounder ? 'founder' : 'investor'
    const senderName = isFounder ? thread.founderName : thread.investorName
    const receiverId = isFounder ? thread.investorId : thread.founderId

    // 1. Create the message
    const message = await Message.create({
      threadId,
      senderId: session.user.id,
      senderRole,
      senderName,
      content: content.trim()
    })

    // 2. Update thread
    await MessageThread.updateOne(
      { threadId },
      { $set: { lastMessage: content.trim(), lastMessageAt: new Date() } }
    )

    // 3. Create Notification for the other party
    await Notification.create({
      userId: receiverId,
      type: 'message',
      title: `New message from ${senderName}`,
      message: content.trim().length > 50 ? content.trim().substring(0, 50) + '...' : content.trim(),
      fromName: senderName,
      pitchId: thread.pitchId,
      isRead: false,
      status: 'pending'
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
