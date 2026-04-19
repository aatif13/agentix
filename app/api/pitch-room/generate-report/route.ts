import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Groq from 'groq-sdk'
import { connectDB } from '@/lib/mongodb'
import Milestone from '@/models/Milestone'
import GrowthExperiment from '@/models/GrowthExperiment'
import WeeklyReport from '@/models/WeeklyReport'
import PitchRoom from '@/models/PitchRoom'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await req.json()
    const {
      startupName,
      tagline,
      stage,
      industry,
      targetMarket,
      problemStatement,
      solution,
      uniqueValueProposition,
      businessModel,
      traction,
      teamDetails,
      fundingAsk,
      useOfFunds,
      founderEmail,
    } = body

    // ── Fetch dynamic traction data ──
    const pitchRoom = await PitchRoom.findOne({ userId: session.user.id }).lean()
    const problemId = pitchRoom?.selectedProblemId

    // 1. Completed Milestones
    const milestones = await Milestone.find({ 
      userId: session.user.id, 
      status: 'completed',
      ...(problemId ? { problemId } : {})
    }).sort({ updatedAt: -1 }).limit(5).lean()
    
    const milestoneStr = milestones.length > 0 
      ? milestones.map(m => `- ${m.title}: ${m.metrics}`).join('\n')
      : 'No completed milestones recorded yet.'

    // 2. Successful Growth Experiments
    const experiments = await GrowthExperiment.find({ 
      userId: session.user.id, 
      status: 'done' 
    }).sort({ updatedAt: -1 }).limit(5).lean()
    
    const experimentStr = experiments.length > 0 
      ? experiments.map(e => `- ${e.title}: ${e.result}`).join('\n')
      : 'No completed growth experiments recorded yet.'

    // 3. Latest Weekly Report Snippet
    const latestWeeklyReport = await WeeklyReport.findOne({ 
      userId: session.user.id 
    }).sort({ weekOf: -1 }).lean()
    
    const weeklySnippet = (latestWeeklyReport?.report as any)?.investorUpdateSnippet 
      || 'No recent weekly progress summary available.'

    const systemPrompt = `You are a world-class startup analyst writing a formal investor report.
Based on the following data, generate a structured report with these sections:
1. Executive Summary
2. Problem & Market Opportunity
3. Solution & Unique Value Proposition
4. Business Model
5. Traction & Milestones: [auto-pulled milestone data]
6. Growth Experiments & Results: [auto-pulled experiment results]
7. Team
8. Financial Ask & Use of Funds
9. Risk Analysis & Mitigation
10. Why Now & Why This Team

Be professional, concise, and data-driven. Write as if this will be read by a Series A investor.`

    const userPrompt = `Generate a comprehensive, data-backed investor report for ${startupName || 'this startup'}.

CORE DETAILS:
Tagline: ${tagline || 'N/A'}
Stage: ${stage || 'N/A'}
Industry: ${industry || 'N/A'}
Target Market: ${targetMarket || 'N/A'}
Problem Statement: ${problemStatement || 'N/A'}
Solution: ${solution || 'N/A'}
Unique Value Proposition: ${uniqueValueProposition || 'N/A'}
Business Model: ${businessModel || 'N/A'}
Team Details: ${teamDetails || 'N/A'}
Funding Ask: $${fundingAsk ? Number(fundingAsk).toLocaleString() : '0'}
Use of Funds: ${useOfFunds || 'N/A'}

TRACTION DATA (AUTHENTICATED FROM PLATFORM):
Completed Milestones:
${milestoneStr}

Growth Experiments & Results:
${experimentStr}

Latest Progress Summary: 
${weeklySnippet}

Manual Traction Note: ${traction || 'N/A'}

Write a formal 800–1200 word investor report with clearly labeled sections. Ensure the Traction and Growth sections explicitly reference the authenticated milestone and experiment data provided above.`

    let investorReport = ''

    try {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.4,
        max_tokens: 2048,
      })

      investorReport = completion.choices[0]?.message?.content || ''
    } catch (groqError) {
      console.error('Groq API error:', groqError)
      // Fallback report structure
      investorReport = `# Investor Report — ${startupName || 'Startup'}

## Executive Summary
${startupName} is an early-stage ${stage} company operating in the ${industry} sector. The company is addressing a critical problem faced by ${targetMarket}.

## Problem & Solution
**Problem:** ${problemStatement}

**Solution:** ${solution}

## Market Opportunity
Operating in ${industry}, targeting ${targetMarket}. The company aims to capture a significant portion of this market through its differentiated approach.

## Business Model
${businessModel}

## Unique Value Proposition
${uniqueValueProposition}

## Traction & Milestones
${traction}

## Team
${teamDetails}

## Financial Ask & Use of Funds
**Funding Ask:** $${Number(fundingAsk || 0).toLocaleString()}

**Use of Funds:** ${useOfFunds}

## Risk Analysis
- Market adoption risk: Early-stage startups face challenges in achieving product-market fit
- Competitive risk: The ${industry} sector has established players
- Execution risk: Team scaling and operational challenges

## Conclusion
${startupName} presents a compelling opportunity for investors seeking exposure to the ${industry} market. The team's focus on solving ${problemStatement.slice(0, 100)}... positions them well for growth.

*Contact: ${founderEmail}*`
    }

    return NextResponse.json({ investorReport })
  } catch (error) {
    console.error('Generate Report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
