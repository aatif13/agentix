import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IInvestorProfile extends Document {
  userId: Types.ObjectId
  fullName: string
  photo: string
  linkedIn: string
  twitter: string
  location: string
  bio: string
  firmName: string
  investmentFocus: string[]
  preferredStage: string[]
  ticketSizeMin: number
  ticketSizeMax: number
  portfolio: string
  notifications: {
    newMatchingStartups: boolean
    watchlistUpdates: boolean
    weeklyDigest: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const InvestorProfileSchema = new Schema<IInvestorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, default: '' },
    photo: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    twitter: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    firmName: { type: String, default: '' },
    investmentFocus: { type: [String], default: [] },
    preferredStage: { type: [String], default: [] },
    ticketSizeMin: { type: Number, default: 0 },
    ticketSizeMax: { type: Number, default: 0 },
    portfolio: { type: String, default: '' },
    notifications: {
      newMatchingStartups: { type: Boolean, default: true },
      watchlistUpdates: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
)

const InvestorProfile: Model<IInvestorProfile> =
  mongoose.models.InvestorProfile ||
  mongoose.model<IInvestorProfile>('InvestorProfile', InvestorProfileSchema)

export default InvestorProfile
