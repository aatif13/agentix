import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Notification from '@/models/Notification'
import User from '@/models/User'
import PitchRoom from '@/models/PitchRoom'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: Number(process.env.EMAIL_SERVER_PORT) || 587,
  auth: {
    user: process.env.EMAIL_SERVER_USER || 'placeholder',
    pass: process.env.EMAIL_SERVER_PASSWORD || 'placeholder',
  },
})

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { notificationId, action } = await req.json()

    if (!notificationId || !['accepted', 'declined'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    await connectDB()

    // 1. Update Notification Status
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id },
      { $set: { status: action, isRead: true } },
      { new: true }
    )

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // 2. We only send emails for investor_interest types
    if (notification.type === 'investor_interest' && notification.fromEmail && notification.pitchId) {
      const founder = await User.findById(session.user.id)
      const pitch = await PitchRoom.findById(notification.pitchId)

      const founderName = founder?.name || 'The founder'
      const startupName = pitch?.startupName || 'the startup'
      const founderEmail = pitch?.founderEmail || founder?.email || 'N/A'
      
      const investorEmail = notification.fromEmail

      // Find investor to create thread
      const investor = await User.findOne({ email: investorEmail })

      // Send Email based on action
      if (process.env.EMAIL_SERVER_USER) {
        try {
          if (action === 'accepted') {
            
            // Create a MessageThread document
            if (investor && pitch) {
              await import('@/models/MessageThread').then(async m => {
                const threadId = `${session.user.id}_${investor._id.toString()}_${pitch._id.toString()}`
                // Upsert to handle edge cases if already created
                await m.default.findOneAndUpdate(
                  { threadId },
                  {
                    threadId,
                    founderId: session.user.id,
                    investorId: investor._id,
                    pitchId: pitch._id,
                    startupName: pitch.startupName,
                    founderName: founderName,
                    investorName: investor.name || 'Investor',
                    status: 'accepted',
                    lastMessage: 'Introduction accepted. You can now message each other.',
                    lastMessageAt: new Date()
                  },
                  { upsert: true }
                )
              })
            }

            await transporter.sendMail({
              from: process.env.EMAIL_FROM || '"Agentix Match" <noreply@agentix.com>',
              to: investorEmail,
              subject: `Great news! ${founderName} accepted your introduction request`,
              text: `The founder of ${startupName} has accepted your request. You can now message them directly on Agentix!\n\nHere is their contact email: ${founderEmail}\n\nThey look forward to connecting with you.`,
              html: `
                <div style="font-family: sans-serif; color: #333;">
                  <h2>Introduction Accepted 🎉</h2>
                  <p>The founder of <strong>${startupName}</strong> has accepted your request.</p>
                  <p>Here is their contact email: <a href="mailto:${founderEmail}">${founderEmail}</a></p>
                  <p>They look forward to connecting with you.</p>
                  <br/>
                  <p style="font-size: 12px; color: #888;">Powered by Agentix Deal Flow</p>
                </div>
              `
            })
          } else if (action === 'declined') {
             await transporter.sendMail({
              from: process.env.EMAIL_FROM || '"Agentix Match" <noreply@agentix.com>',
              to: investorEmail,
              subject: `Update on your introduction request for ${startupName}`,
              text: `Thank you for your interest. The founder is not accepting new investor introductions at this time.`,
              html: `
                <div style="font-family: sans-serif; color: #333;">
                  <h2>Request Update</h2>
                  <p>Thank you for your interest in <strong>${startupName}</strong>.</p>
                  <p>The founder is not accepting new investor introductions at this time.</p>
                  <br/>
                  <p style="font-size: 12px; color: #888;">Powered by Agentix Deal Flow</p>
                </div>
              `
            })
          }
        } catch (emailErr) {
          console.error("Failed to send notification email:", emailErr)
          // We don't fail the whole request just because email failed
        }
      } else {
        console.warn("EMAIL_SERVER_USER not configured. Simulated sending email to:", investorEmail)
      }
    }

    return NextResponse.json({ success: true, notification })

  } catch (error) {
    console.error('Respond Notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
