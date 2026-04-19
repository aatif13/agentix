import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IWeeklyReport extends Document {
  userId: Types.ObjectId
  weekOf: Date
  report: any
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

const WeeklyReportSchema = new Schema<IWeeklyReport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekOf: { type: Date, required: true },
    report: { type: Schema.Types.Mixed },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

const WeeklyReport: Model<IWeeklyReport> =
  mongoose.models.WeeklyReport ||
  mongoose.model<IWeeklyReport>('WeeklyReport', WeeklyReportSchema)

export default WeeklyReport
