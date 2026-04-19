import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IGrowthExperiment extends Document {
  userId: Types.ObjectId
  title: string
  hypothesis: string
  testMethod?: string
  successMetric?: string
  channel: string
  expectedImpact: 'Low' | 'Medium' | 'High'
  effort: 'Low' | 'Medium' | 'High'
  status: 'backlog' | 'running' | 'done' | 'failed'
  result?: string
  aiGenerated: boolean
  createdAt: Date
  updatedAt: Date
}

const GrowthExperimentSchema = new Schema<IGrowthExperiment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    hypothesis: { type: String, required: true },
    testMethod: { type: String, default: '' },
    successMetric: { type: String, default: '' },
    channel: { type: String, required: true },
    expectedImpact: { type: String, enum: ['Low', 'Medium', 'High'] },
    effort: { type: String, enum: ['Low', 'Medium', 'High'] },
    status: {
      type: String,
      enum: ['backlog', 'running', 'done', 'failed'],
      default: 'backlog',
    },
    result: { type: String },
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
)

const GrowthExperiment: Model<IGrowthExperiment> =
  mongoose.models.GrowthExperiment ||
  mongoose.model<IGrowthExperiment>('GrowthExperiment', GrowthExperimentSchema)

export default GrowthExperiment
