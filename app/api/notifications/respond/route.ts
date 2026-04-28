import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import MessageThread from '@/models/MessageThread'
import PitchRoom from '@/models/PitchRoom'
import User from '@/models/User'
import InterestRequest from '@/models/InterestRequest'

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, action } = await req.json()

    if (!notificationId || !action) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    await connectDB()

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (action === 'accepted') {
      // Update notification status
      await Notification.findByIdAndUpdate(notificationId, { 
        status: 'accepted', 
        isRead: true 
      })

      // Fetch required data
      const founder = await User.findById(session.user.id)
      const pitch = await PitchRoom.findById(notification.pitchId)
      
      // Use fromUserId or fall back to finding investor by email
      const investorId = notification.fromUserId
      
      console.log('Creating thread with:', {
        founderId: session.user.id,
        investorId,
        pitchId: notification.pitchId,
        fromName: notification.fromName
      })

      if (!investorId) {
        console.error('No fromUserId on notification:', notification)
        // Still create thread with available data
      }

      const threadId = `${session.user.id}_${investorId}_${notification.pitchId}`

      // Check if thread already exists
      const existing = await MessageThread.findOne({ threadId })
      
      if (!existing) {
        const thread = await MessageThread.create({
          threadId,
          founderId: session.user.id,
          investorId: investorId || null,
          pitchId: notification.pitchId,
          startupName: pitch?.startupName || 'Startup',
          founderName: founder?.name || session.user.name || 'Founder',
          investorName: notification.fromName || 'Investor',
          status: 'accepted',
          lastMessage: 'Introduction accepted. You can now message each other.',
          lastMessageAt: new Date()
        })
        console.log('Thread created:', thread._id)
      } else {
        console.log('Thread already exists:', existing._id)
      }

      // Also update any matching InterestRequest so investor UI reflects accepted status
      try {
        if (notification.fromUserId && notification.pitchId) {
          await InterestRequest.findOneAndUpdate(
            { investorId: notification.fromUserId, startupId: notification.pitchId },
            { status: 'accepted' }
          )
        }
      } catch (e) {
        console.error('Failed to update InterestRequest status:', e)
      }

    } else if (action === 'declined') {
      await Notification.findByIdAndUpdate(notificationId, { 
        status: 'declined',
        isRead: true 
      })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Respond error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
