import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IMilestone extends Document {
  userId: Types.ObjectId
  problemId?: Types.ObjectId | null
  title: string
  description: string
  targetDate: Date
  status: 'planned' | 'in-progress' | 'completed'
  metrics: string
  createdAt: Date
  updatedAt: Date
}

const MilestoneSchema = new Schema<IMilestone>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: Schema.Types.ObjectId, ref: 'ProblemFinderResult', default: null },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    targetDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed'],
      default: 'planned',
    },
    metrics: { type: String, default: '' },
  },
  { timestamps: true }
)

const Milestone: Model<IMilestone> =
  mongoose.models.Milestone ||
  mongoose.model<IMilestone>('Milestone', MilestoneSchema)

export default Milestone
