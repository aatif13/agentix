import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import Chat from '@/models/Chat'
import User from '@/models/User'
import ProblemFinderResult from '@/models/ProblemFinderResult'
import { groq } from '@/lib/groq'

const agentSystemPrompts: Record<string, string> = {
  supervisor: `You are a Supervisor AI agent for a startup ecosystem platform called Agentix. You help founders with any startup-related questions. You coordinate between research, marketing, legal, finance and code tasks. Be specific, actionable and concise.`,
  research: `You are a Research AI agent specialized in market research, competitor analysis, TAM/SAM/SOM estimation, and industry trends. Give specific data-driven insights for startup founders.`,
  code: `You are a Code AI agent specialized in software architecture, MVP development, tech stack recommendations, and code reviews. Give practical technical advice for startup builders.`,
  marketing: `You are a Marketing AI agent specialized in growth hacking, SEO, content strategy, social media, and GTM strategies for startups. Give specific actionable marketing advice.`,
  legal: `You are a Legal AI agent specialized in startup law, co-founder agreements, equity splits, IP protection, GDPR compliance, and fundraising legal requirements. Always add disclaimer that this is not formal legal advice.`,
  finance: `You are a Finance AI agent specialized in financial modeling, burn rate, runway calculation, fundraising strategy, and unit economics for early-stage startups. Give specific numbers and formulas.`,
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()
    const chat = await Chat.findOne({ _id: id, userId: session.user.id })

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json({ chat })
  } catch (error) {
    console.error('GET chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { content } = await req.json()

    await connectDB()

    let chat = await Chat.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        $push: {
          messages: {
            role: 'user',
            content,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    )

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    let systemPrompt = agentSystemPrompts[chat!.agent] || agentSystemPrompts.supervisor

    // Inject Problem Context if available
    const user = await User.findById(session.user.id).lean()
    if (user?.selectedProblemId) {
      const problemResult = await ProblemFinderResult.findById(user.selectedProblemId).lean()
      if (problemResult) {
        const problem = problemResult.problems[user.selectedProblemIndex || 0]
        systemPrompt += `\n\nACTIVE USER CONTEXT:
The user is currently focused on solving this specific problem: "${problem.title}"
Context: ${problem.reason}
Identified Opportunity: ${problem.startupOpportunity}
Target Group: ${problem.affectedGroup}
Location: ${problemResult.location.district}, ${problemResult.location.state}, ${problemResult.location.country}
Domain: ${problemResult.domain} > ${problemResult.subDomain}

Please ensure your advice is tailored to this specific context whenever relevant.`
      }
    }

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          ...chat!.messages.slice(0, -1).map((m: any) => ({
            role: m.role,
            content: m.content,
          })),
          { role: 'user', content }
        ],
        max_tokens: 500,
        temperature: 0.7,
      })

      const aiResponse = completion.choices[0].message.content

      // Add agent context from existing config
      const agentConfig: Record<string, { name: string; emoji: string }> = {
        supervisor: { name: 'Supervisor', emoji: '🧠' },
        research: { name: 'Research Agent', emoji: '🔍' },
        code: { name: 'Code Agent', emoji: '💻' },
        marketing: { name: 'Marketing Agent', emoji: '📣' },
        legal: { name: 'Legal Agent', emoji: '⚖️' },
        finance: { name: 'Finance Agent', emoji: '💰' },
      }
      const agentInfo = agentConfig[chat.agent] || agentConfig.supervisor

      chat = await Chat.findByIdAndUpdate(
        chat._id,
        {
          $push: {
            messages: {
              role: 'assistant',
              content: aiResponse,
              agentName: agentInfo.name,
              agentEmoji: agentInfo.emoji,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      )

      return NextResponse.json({ chat })
    } catch (groqError) {
      console.error('Groq Error:', groqError)
      
      const agentConfig: Record<string, { name: string; emoji: string }> = {
        supervisor: { name: 'Supervisor', emoji: '🧠' },
        research: { name: 'Research Agent', emoji: '🔍' },
        code: { name: 'Code Agent', emoji: '💻' },
        marketing: { name: 'Marketing Agent', emoji: '📣' },
        legal: { name: 'Legal Agent', emoji: '⚖️' },
        finance: { name: 'Finance Agent', emoji: '💰' },
      }
      const agentInfo = agentConfig[chat!.agent] || agentConfig.supervisor
      
      chat = await Chat.findByIdAndUpdate(
        chat!._id,
        {
          $push: {
            messages: {
              role: 'assistant',
              content: 'Agent unavailable. Please try again.',
              agentName: agentInfo.name,
              agentEmoji: agentInfo.emoji,
              timestamp: new Date(),
            },
          },
        },
        { new: true }
      )
      return NextResponse.json({ chat })
    }
  } catch (error) {
    console.error('PUT chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()

    const chat = await Chat.findOneAndDelete({ _id: id, userId: session.user.id })
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Chat deleted' })
  } catch (error) {
    console.error('DELETE chat error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
