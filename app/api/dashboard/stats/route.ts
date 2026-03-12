import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import AgentTask from '@/models/AgentTask'
import Chat from '@/models/Chat'
import IdeaValidation from '@/models/IdeaValidation'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id

    const [totalTasks, completedTasks, activeChats, totalIdeas, recentTasks, recentChats] =
      await Promise.all([
        AgentTask.countDocuments({ userId }),
        AgentTask.countDocuments({ userId, status: 'completed' }),
        Chat.countDocuments({ userId }),
        IdeaValidation.countDocuments({ userId }),
        AgentTask.find({ userId })
          .sort({ createdAt: -1 })
          .limit(4)
          .select('taskName agent agentEmoji status createdAt'),
        Chat.find({ userId })
          .sort({ updatedAt: -1 })
          .limit(4)
          .select('title agent updatedAt'),
      ])

    // Combine recent activity
    const taskActivity = recentTasks.map((t) => ({
      id: t._id.toString(),
      type: 'task',
      label: t.taskName,
      agent: t.agent,
      emoji: t.agentEmoji,
      status: t.status,
      date: t.createdAt,
    }))

    const chatActivity = recentChats.map((c) => ({
      id: c._id.toString(),
      type: 'chat',
      label: c.title,
      agent: c.agent,
      emoji: '💬',
      status: 'active',
      date: c.updatedAt,
    }))

    const recentActivity = [...taskActivity, ...chatActivity]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)

    // Weekly activity: last 7 days
    const today = new Date()
    const weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today)
      day.setDate(today.getDate() - i)
      const start = new Date(day.setHours(0, 0, 0, 0))
      const end = new Date(day.setHours(23, 59, 59, 999))

      const count = await AgentTask.countDocuments({
        userId,
        createdAt: { $gte: start, $lte: end },
      })

      weeklyActivity.push({
        day: start.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: count,
      })
    }

    return NextResponse.json({
      totalTasks,
      completedTasks,
      activeChats,
      totalIdeas,
      recentActivity,
      weeklyActivity,
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
