import IdeaValidation from '@/models/IdeaValidation'
import Milestone from '@/models/Milestone'
import GrowthExperiment from '@/models/GrowthExperiment'
import WeeklyReport from '@/models/WeeklyReport'
import { IPitchRoom } from '@/models/PitchRoom'

export async function calculateReadinessScore(userId: string, pitch: IPitchRoom) {
  try {
    const [validation, milestones, experiments, reports] = await Promise.all([
      IdeaValidation.findOne({ userId }).select('validationScore').lean(),
      Milestone.countDocuments({ userId, status: 'completed' }),
      GrowthExperiment.countDocuments({ userId, status: 'done' }),
      WeeklyReport.countDocuments({ userId }),
    ])

    // 1. Validation Score (Max 30pts)
    const validationPts = validation ? Math.min(30, (validation.validationScore / 100) * 30) : 0

    // 2. Milestones (Max 20pts) - 5pts per completed milestone
    const milestonePts = Math.min(20, (milestones || 0) * 5)

    // 3. Experiments (Max 20pts) - 10pts per 'done' experiment
    const experimentPts = Math.min(20, (experiments || 0) * 10)

    // 4. Reporting (Max 10pts) - 5pts per report
    const reportPts = Math.min(10, (reports || 0) * 5)

    // 5. Pitch Completeness (Max 20pts)
    const coreFields: (keyof IPitchRoom)[] = [
      'startupName', 'tagline', 'stage', 'industry', 'targetMarket',
      'problemStatement', 'solution', 'uniqueValueProposition',
      'businessModel', 'traction', 'teamDetails', 'fundingAsk',
      'useOfFunds', 'founderEmail', 'investorReport'
    ]
    
    let filledFields = 0
    coreFields.forEach(field => {
      const val = (pitch as any)[field]
      if (val && (typeof val !== 'number' || val > 0)) {
        filledFields++
      }
    })
    
    const pitchPts = (filledFields / coreFields.length) * 20

    const totalScore = Math.round(validationPts + milestonePts + experimentPts + reportPts + pitchPts)

    return {
      score: totalScore,
      breakdown: {
        validation: Math.round(validationPts),
        milestones: Math.round(milestonePts),
        experiments: Math.round(experimentPts),
        reports: Math.round(reportPts),
        pitch: Math.round(pitchPts),
      }
    }
  } catch (error) {
    console.error('Readiness Score Calc error:', error)
    return { score: 0, breakdown: null }
  }
}
