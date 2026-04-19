import mongoose, { Schema, Document } from 'mongoose'

export interface IMessageThread extends Document {
  threadId: string
  founderId: mongoose.Types.ObjectId
  investorId: mongoose.Types.ObjectId
  pitchId: mongoose.Types.ObjectId
  startupName: string
  founderName: string
  investorName: string
  status: 'pending' | 'accepted' | 'declined'
  lastMessage: string
  lastMessageAt: Date
  createdAt: Date
}

const MessageThreadSchema = new Schema({
  threadId: { type: String, required: true, unique: true },
  founderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pitchId: { type: Schema.Types.ObjectId, ref: 'PitchRoom', required: true },
  startupName: { type: String, required: true },
  founderName: { type: String, required: true },
  investorName: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'accepted' },
  lastMessage: { type: String },
  lastMessageAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.MessageThread || mongoose.model<IMessageThread>('MessageThread', MessageThreadSchema)
