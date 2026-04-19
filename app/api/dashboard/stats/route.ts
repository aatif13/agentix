import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { connectDB } from '@/lib/mongodb'
import User from '@/models/User'
import ProblemFinderResult from '@/models/ProblemFinderResult'
import IdeaValidation from '@/models/IdeaValidation'
import BuildProject from '@/models/BuildProject'
import Milestone from '@/models/Milestone'
import PitchRoom from '@/models/PitchRoom'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const userId = session.user.id

    // Fetch user and related data
    const user = await User.findById(userId).lean()
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 1. Problem Selected
    let problemTitle = 'None'
    if (user.selectedProblemId) {
      const pfr = await ProblemFinderResult.findById(user.selectedProblemId).lean()
      if (pfr && pfr.problems) {
        const idx = user.selectedProblemIndex || 0
        problemTitle = pfr.problems[idx]?.title || 'Unknown Problem'
      }
    }

    // 2. Idea Validated
    const latestIdea = await IdeaValidation.findOne({ userId }).sort({ createdAt: -1 }).lean()

    // 3. Blueprint Generated
    const latestProject = await BuildProject.findOne({ userId }).sort({ createdAt: -1 }).lean()

    // 4. Growth Started (Check for any milestones)
    const milestones = await Milestone.find({ userId }).lean()
    const completedMilestones = milestones.filter(m => m.status === 'completed').length

    // 5. Pitch Published
    const pitch = await PitchRoom.findOne({ userId }).lean()
    let viewCount = 0
    let interestCount = 0

    if (pitch) {
      viewCount = pitch.viewCount || 0
      interestCount = await import('@/models/Notification').then(m => 
        m.default.countDocuments({ userId, type: 'investor_interest', pitchId: pitch._id })
      )
    }

    // JOURNEY TRACKER DATA
    const journey = [
      {
        id: 'problem',
        label: 'Problem Selected',
        status: user.selectedProblemId ? 'completed' : 'in-progress',
        summary: user.selectedProblemId ? `Selected: ${problemTitle}` : 'Find a problem to solve',
        cta: '/dashboard/problem-finder',
        ctaLabel: user.selectedProblemId ? 'Change Problem' : 'Find Problem'
      },
      {
        id: 'idea',
        label: 'Idea Validated',
        status: latestIdea ? 'completed' : (user.selectedProblemId ? 'in-progress' : 'locked'),
        summary: latestIdea ? `Score: ${latestIdea.validationScore}/100 - ${latestIdea.ideaTitle}` : 'Validate your startup idea',
        cta: '/dashboard/idea-lab',
        ctaLabel: latestIdea ? 'Re-validate' : 'Validate Idea'
      },
      {
        id: 'blueprint',
        label: 'Blueprint Generated',
        status: latestProject ? 'completed' : (latestIdea ? 'in-progress' : 'locked'),
        summary: latestProject ? `${latestProject.projectName} Blueprint Ready` : 'Generate technical blueprint',
        cta: '/dashboard/build-studio',
        ctaLabel: latestProject ? 'View Blueprint' : 'Generate'
      },
      {
        id: 'growth',
        label: 'Growth Started',
        status: completedMilestones > 0 ? 'completed' : (latestProject ? 'in-progress' : 'locked'),
        summary: milestones.length > 0 ? `${milestones.length} Milestones Active` : 'Set growth milestones',
        cta: '/dashboard/growth/milestones',
        ctaLabel: milestones.length > 0 ? 'View Track' : 'Start Growth'
      },
      {
        id: 'pitch',
        label: 'Pitch Published',
        status: pitch?.isPublic ? 'completed' : (milestones.length > 0 ? 'in-progress' : 'locked'),
        summary: pitch ? (pitch.isPublic ? 'Visible to Investors' : 'Draft mode') : 'Create your pitch room',
        cta: '/dashboard/pitch-room',
        ctaLabel: pitch ? (pitch.isPublic ? 'View Pitch' : 'Publish') : 'Create Pitch'
      }
    ]

    return NextResponse.json({
      activeProblem: problemTitle,
      latestIdeaScore: latestIdea?.validationScore || 0,
      pitchStatus: pitch ? (pitch.isPublic ? 'Published' : 'Draft') : 'Not Started',
      viewCount,
      interestCount,
      journey
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
