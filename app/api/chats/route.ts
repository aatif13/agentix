import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import { groq } from '@/lib/groq'

const agentSystemPrompts: Record<string, string> = {
  supervisor: `You are a Supervisor AI agent for a startup ecosystem platform called Agentix. You help founders with any startup-related questions. You coordinate between research, marketing, legal, finance and code tasks. Be specific, actionable and concise.`,
  research: `You are a Research AI agent specialized in market research, competitor analysis, TAM/SAM/SOM estimation, and industry trends. Give specific data-driven insights for startup founders.`,
  code: `You are a Code AI agent specialized in software architecture, MVP development, tech stack recommendations, and code reviews. Give practical technical advice for startup builders.`,
  marketing: `You are a Marketing AI agent specialized in growth hacking, SEO, content strategy, social media, and GTM strategies for startups. Give specific actionable marketing advice.`,
  legal: `You are a Legal AI agent specialized in startup law, co-founder agreements, equity splits, IP protection, GDPR compliance, and fundraising legal requirements. Always add disclaimer that this is not formal legal advice.`,
  finance: `You are a Finance AI agent specialized in financial modeling, burn rate, runway calculation, fundraising strategy, and unit economics for early-stage startups. Give specific numbers and formulas.`,
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const chats = await Chat.find({ userId: session.user.id })
      .select('title agent updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean()

    return NextResponse.json({ chats })
  } catch (error) {
    console.error('GET chats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { firstMessage, agent = 'supervisor' } = await req.json()

    if (!firstMessage) {
      return NextResponse.json({ error: 'First message required' }, { status: 400 })
    }

    const title = firstMessage.split(' ').slice(0, 6).join(' ')

    const agentConfig: Record<string, { name: string; emoji: string }> = {
      supervisor: { name: 'Supervisor', emoji: '🧠' },
      research: { name: 'Research Agent', emoji: '🔍' },
      code: { name: 'Code Agent', emoji: '💻' },
      marketing: { name: 'Marketing Agent', emoji: '📣' },
      legal: { name: 'Legal Agent', emoji: '⚖️' },
      finance: { name: 'Finance Agent', emoji: '💰' },
    }

    const agentInfo = agentConfig[agent] || agentConfig.supervisor

    await connectDB()
    const chat = await Chat.create({
      userId: session.user.id,
      title,
      agent,
      messages: [
        {
          role: 'user',
          content: firstMessage,
          timestamp: new Date(),
        },
      ],
    })

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: agentSystemPrompts[agent] || agentSystemPrompts.supervisor },
          { role: 'user', content: firstMessage }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const aiResponse = completion.choices[0].message.content

      await Chat.findByIdAndUpdate(chat._id, {
        $push: {
          messages: {
            role: 'assistant',
            content: aiResponse,
            agentName: agentInfo.name,
            agentEmoji: agentInfo.emoji,
            timestamp: new Date(),
          },
        },
      })
    } catch (groqError) {
      console.error('Groq Error:', groqError)
      // Provide an error message as the assistant if Groq fails
      await Chat.findByIdAndUpdate(chat._id, {
        $push: {
          messages: {
            role: 'assistant',
            content: 'Agent unavailable. Please try again.',
            agentName: agentInfo.name,
            agentEmoji: agentInfo.emoji,
            timestamp: new Date(),
          },
        },
      })
    }

    const fullChat = await Chat.findById(chat._id)
    return NextResponse.json({ chat: fullChat }, { status: 201 })
  } catch (error) {
    console.error('POST chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
