import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  avatar: string
  plan: 'starter' | 'growth' | 'enterprise'
  startupName?: string
  startupIdea?: string
  openaiKey?: string
  serperKey?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false, default: null },
    avatar: { type: String, default: '' },
    plan: { type: String, enum: ['starter', 'growth', 'enterprise'], default: 'starter' },
    startupName: { type: String },
    startupIdea: { type: String },
    openaiKey: { type: String },
    serperKey: { type: String },
  },
  { timestamps: true }
)

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export default User
