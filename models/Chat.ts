import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IMessage {
  role: 'user' | 'assistant'
  content: string
  agentName?: string
  agentEmoji?: string
  timestamp: Date
}

export interface IChat extends Document {
  userId: Types.ObjectId
  title: string
  agent: 'supervisor' | 'research' | 'code' | 'marketing' | 'legal' | 'finance'
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  agentName: { type: String },
  agentEmoji: { type: String },
  timestamp: { type: Date, default: Date.now },
})

const ChatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    agent: {
      type: String,
      enum: ['supervisor', 'research', 'code', 'marketing', 'legal', 'finance'],
      default: 'supervisor',
    },
    messages: [MessageSchema],
  },
  { timestamps: true }
)

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema)
export default Chat
