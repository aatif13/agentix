import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'

// GET — fetch all notifications for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const query: any = { userId: session.user.id }
    if (status) query.status = status
    if (type) query.type = type

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH — mark specific notification as read
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
    console.error('Notification PATCH error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE — mark all notifications as read or clear them
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Mark all as read instead of physically deleting
    await Notification.updateMany(
      { userId: session.user.id, isRead: false },
      { $set: { isRead: true } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notifications DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
