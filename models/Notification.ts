import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId
  type: 'investor_interest' | 'pitch_viewed' | 'message' | 'startup_match' | 'startup_update'
  title: string
  message: string
  fromName?: string
  fromEmail?: string
  firmName?: string
  pitchId?: mongoose.Types.ObjectId
  isRead: boolean
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['investor_interest', 'pitch_viewed', 'message', 'startup_match', 'startup_update'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  fromName: { type: String },
  fromEmail: { type: String },
  firmName: { type: String },
  pitchId: { type: Schema.Types.ObjectId, ref: 'PitchRoom' },
  isRead: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true // adds updatedAt and createdAt automatically
})

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
