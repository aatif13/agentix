import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IWatchlist extends Document {
  investorId: Types.ObjectId
  startupId: Types.ObjectId
  savedAt: Date
}

const WatchlistSchema = new Schema<IWatchlist>(
  {
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startupId: { type: Schema.Types.ObjectId, ref: 'IdeaValidation', required: true },
    savedAt: { type: Date, default: Date.now },
  },
)

WatchlistSchema.index({ investorId: 1, startupId: 1 }, { unique: true })

const Watchlist: Model<IWatchlist> =
  mongoose.models.Watchlist || mongoose.model<IWatchlist>('Watchlist', WatchlistSchema)
export default Watchlist
