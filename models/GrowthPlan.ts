import mongoose, { Schema, Document } from 'mongoose'

export interface IGrowthPlan extends Document {
  userId: mongoose.Types.ObjectId
  productName: string
  targetAudience: string
  growthGoal: string
  channels: string[]
  plan: any
  status: 'generating' | 'complete' | 'failed'
  createdAt: Date
  updatedAt: Date
}

const growthPlanSchema = new Schema<IGrowthPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    growthGoal: {
      type: String,
      enum: [
        'Get First 100 Users',
        'Increase MRR',
        'Launch on ProductHunt',
        'Build SEO Traffic',
        'Grow Email List',
      ],
      required: true,
    },
    channels: [{ type: String }],
    plan: {
      type: Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['generating', 'complete', 'failed'],
      default: 'generating',
    },
  },
  { timestamps: true }
)

const GrowthPlan =
  mongoose.models.GrowthPlan ||
  mongoose.model<IGrowthPlan>('GrowthPlan', growthPlanSchema)

export default GrowthPlan
