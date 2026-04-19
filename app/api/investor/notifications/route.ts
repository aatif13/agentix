import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Investor Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    await connectDB()

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: { isRead: true } },
      { new: true }
    )

    return NextResponse.json({ success: true, notification })
  } catch (error) {
    console.error('Investor Notification PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { $set: { isRead: true } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Investor Notifications DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
