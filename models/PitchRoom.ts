import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IPitchRoom extends Document {
  userId: Types.ObjectId
  selectedProblemId?: Types.ObjectId | null
  startupName: string
  tagline: string
  stage: 'idea' | 'mvp' | 'revenue' | 'scaling'
  industry: string
  targetMarket: string
  problemStatement: string
  solution: string
  uniqueValueProposition: string
  businessModel: string
  traction: string
  teamDetails: string
  fundingAsk: number
  useOfFunds: string
  founderEmail: string
  investorReport: string
  isPublic: boolean
  viewCount: number
  viewedBy: Array<{ investorId: Types.ObjectId; viewedAt: Date }>
  createdAt: Date
  updatedAt: Date
}

const PitchRoomSchema = new Schema<IPitchRoom>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    selectedProblemId: { type: Schema.Types.ObjectId, ref: 'ProblemFinderResult', default: null },
    startupName: { type: String, default: '' },
    tagline: { type: String, default: '' },
    stage: {
      type: String,
      enum: ['idea', 'mvp', 'revenue', 'scaling'],
      default: 'idea',
    },
    industry: { type: String, default: '' },
    targetMarket: { type: String, default: '' },
    problemStatement: { type: String, default: '' },
    solution: { type: String, default: '' },
    uniqueValueProposition: { type: String, default: '' },
    businessModel: { type: String, default: '' },
    traction: { type: String, default: '' },
    teamDetails: { type: String, default: '' },
    fundingAsk: { type: Number, default: 0 },
    useOfFunds: { type: String, default: '' },
    founderEmail: { type: String, default: '' },
    investorReport: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
    viewedBy: [
      {
        investorId: { type: Schema.Types.ObjectId, ref: 'User' },
        viewedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const PitchRoom: Model<IPitchRoom> =
  mongoose.models.PitchRoom ||
  mongoose.model<IPitchRoom>('PitchRoom', PitchRoomSchema)

export default PitchRoom
