import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IInterestRequest extends Document {
  investorId: Types.ObjectId
  startupId: Types.ObjectId
  message: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

const InterestRequestSchema = new Schema<IInterestRequest>(
  {
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startupId: { type: Schema.Types.ObjectId, ref: 'IdeaValidation', required: true },
    message: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  },
  { timestamps: true }
)

InterestRequestSchema.index({ investorId: 1, startupId: 1 })

const InterestRequest: Model<IInterestRequest> =
  mongoose.models.InterestRequest || mongoose.model<IInterestRequest>('InterestRequest', InterestRequestSchema)
export default InterestRequest
