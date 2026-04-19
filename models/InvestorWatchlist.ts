import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IInvestorWatchlist extends Document {
  investorId: Types.ObjectId
  pitchId: Types.ObjectId
  savedAt: Date
}

const InvestorWatchlistSchema = new Schema<IInvestorWatchlist>(
  {
    investorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pitchId: { type: Schema.Types.ObjectId, ref: 'PitchRoom', required: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

// Ensure an investor can only watchlist a specific pitch once
InvestorWatchlistSchema.index({ investorId: 1, pitchId: 1 }, { unique: true })

const InvestorWatchlist: Model<IInvestorWatchlist> =
  mongoose.models.InvestorWatchlist || 
  mongoose.model<IInvestorWatchlist>('InvestorWatchlist', InvestorWatchlistSchema)

export default InvestorWatchlist
