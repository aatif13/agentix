import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
  threadId: string
  senderId: mongoose.Types.ObjectId
  senderRole: 'founder' | 'investor'
  senderName: string
  content: string
  isRead: boolean
  createdAt: Date
}

const MessageSchema = new Schema({
  threadId: { type: String, required: true, index: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  senderRole: { type: String, enum: ['founder', 'investor'], required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema)
