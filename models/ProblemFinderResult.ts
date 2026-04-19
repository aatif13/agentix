import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IProblem {
  title: string
  severity: 'High' | 'Medium' | 'Low'
  affectedGroup: string
  reason: string
  startupOpportunity: string
  monetization: string
}

export interface IProblemFinderResult extends Document {
  userId: Types.ObjectId
  location: {
    country: string
    state: string
    district: string
    region?: string
  }
  domain: string
  subDomain: string
  problems: IProblem[]
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    severity: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
    },
    affectedGroup: { type: String, required: true },
    reason: { type: String, required: true },
    startupOpportunity: { type: String, required: true },
    monetization: { type: String, required: true },
  },
  { _id: false }
)

const ProblemFinderResultSchema = new Schema<IProblemFinderResult>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      district: { type: String, required: true },
      region: { type: String },
    },
    domain: { type: String, required: true },
    subDomain: { type: String, required: true },
    problems: { type: [ProblemSchema], required: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const ProblemFinderResult: Model<IProblemFinderResult> =
  mongoose.models.ProblemFinderResult ||
  mongoose.model<IProblemFinderResult>('ProblemFinderResult', ProblemFinderResultSchema)

export default ProblemFinderResult
