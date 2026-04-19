import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar: string
  role: 'founder' | 'investor'
  plan: 'starter' | 'growth' | 'enterprise'
  startupName?: string
  startupIdea?: string
  openaiKey?: string
  serperKey?: string
  selectedProblemId?: mongoose.Types.ObjectId | null
  selectedProblemIndex?: number | null
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  location?: string
  bio?: string
  preferredIndustry?: string
  stage?: 'idea' | 'mvp' | 'revenue' | 'scaling'
  cofounderStatus?: 'solo' | 'has co-founder' | 'looking for co-founder'
  notifications?: {
    investorViews: boolean
    progressReminders: boolean
    problemSuggestions: boolean
  }
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false, default: null },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['founder', 'investor'], default: 'founder' },
    plan: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter' },
    startupName: { type: String },
    startupIdea: { type: String },
    openaiKey: { type: String },
    serperKey: { type: String },
    selectedProblemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProblemFinderResult', default: null },
    selectedProblemIndex: { type: Number, default: 0 },
    linkedinUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    bio: { type: String, default: '' },
    preferredIndustry: { type: String, default: '' },
    stage: { type: String, enum: ['idea', 'mvp', 'revenue', 'scaling'], default: 'idea' },
    cofounderStatus: { type: String, enum: ['solo', 'has co-founder', 'looking for co-founder'], default: 'solo' },
    notifications: {
      investorViews: { type: Boolean, default: true },
      progressReminders: { type: Boolean, default: true },
      problemSuggestions: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
