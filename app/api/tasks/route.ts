import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import AgentTask from '@/models/AgentTask'

const agentEmojis: Record<string, string> = {
  Research: '🔍',
  Code: '💻',
  Marketing: '📣',
  Legal: '⚖️',
  Finance: '💰',
  Analytics: '📊',
}

const mockResults: Record<string, string> = {
  Research: 'Market research completed. Found 3 key opportunities, 5 competitor weaknesses, and 12 relevant data points to inform your strategy.',
  Code: 'Code generation complete. Produced 420 lines of production-ready TypeScript with tests, documentation, and deployment config.',
  Marketing: 'Content strategy built. Created 30-day campaign calendar, 15 social posts, 3 email sequences, and ad copy variants.',
  Legal: 'Legal review done. Identified 2 compliance gaps, drafted ToS updates, and provided IP protection recommendations.',
  Finance: 'Financial model built. 12-month projections show path to $500K ARR with current burn rate and proposed optimizations.',
  Analytics: 'Analytics audit complete. Found 8 conversion opportunities, proposed 5 experiments, and configured 12 new tracking events.',
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const tasks = await AgentTask.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('GET tasks error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { taskName, description, agent } = await req.json()

    if (!taskName || !description || !agent) {
      return NextResponse.json({ error: 'Task name, description, and agent are required' }, { status: 400 })
    }

    await connectDB()

    const task = await AgentTask.create({
      userId: session.user.id,
      taskName,
      description,
      agent,
      agentEmoji: agentEmojis[agent] || '🤖',
      status: 'queued',
    })

    // Simulate task progression: queued → running (1s) → completed (3s)
    setTimeout(async () => {
      try {
        await AgentTask.findByIdAndUpdate(task._id, {
          status: 'running',
          startedAt: new Date(),
        })

        setTimeout(async () => {
          try {
            await AgentTask.findByIdAndUpdate(task._id, {
              status: 'completed',
              result: mockResults[agent] || 'Task completed successfully.',
              completedAt: new Date(),
            })
          } catch (e) {
            console.error('Task completion error:', e)
          }
        }, 3000)
      } catch (e) {
        console.error('Task start error:', e)
      }
    }, 1000)

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('POST task error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
