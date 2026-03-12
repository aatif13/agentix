import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface ILeanCanvas {
  problem?: string
  solution?: string
  uvp?: string
  channels?: string
  customerSegments?: string
  revenueStreams?: string
  costStructure?: string
  keyMetrics?: string
  unfairAdvantage?: string
}

export interface ICompetitor {
  name: string
  funding: string
  users: string
  weakness: string
}

export interface IIdeaValidation extends Document {
  userId: Types.ObjectId
  ideaTitle: string
  ideaDescription: string
  industry: string
  targetMarket: string
  validationScore: number
  marketSize: string
  competitionLevel: 'Low' | 'Medium' | 'High'
  feasibilityScore: number
  trendScore: number
  leanCanvas: ILeanCanvas
  competitors: ICompetitor[]
  status: 'pending' | 'analyzing' | 'complete'
  createdAt: Date
}

const IdeaValidationSchema = new Schema<IIdeaValidation>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ideaTitle: { type: String, required: true },
    ideaDescription: { type: String, required: true },
    industry: { type: String, required: true },
    targetMarket: { type: String },
    validationScore: { type: Number, default: 0 },
    marketSize: { type: String },
    competitionLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
    feasibilityScore: { type: Number, default: 0 },
    trendScore: { type: Number, default: 0 },
    leanCanvas: {
      problem: String,
      solution: String,
      uvp: String,
      channels: String,
      customerSegments: String,
      revenueStreams: String,
      costStructure: String,
      keyMetrics: String,
      unfairAdvantage: String,
    },
    competitors: [
      {
        name: String,
        funding: String,
        users: String,
        weakness: String,
      },
    ],
    status: { type: String, enum: ['pending', 'analyzing', 'complete'], default: 'pending' },
  },
  { timestamps: true }
)

const IdeaValidation: Model<IIdeaValidation> =
  mongoose.models.IdeaValidation ||
  mongoose.model<IIdeaValidation>('IdeaValidation', IdeaValidationSchema)
export default IdeaValidation
