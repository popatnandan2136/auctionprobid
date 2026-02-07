import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
  name: String,
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
  category: String,
  role: String,
  basePrice: Number,
  status: { type: String, enum: ["NOT_IN_AUCTION", "IN_AUCTION", "SOLD", "UNSOLD"], default: "NOT_IN_AUCTION" },
  soldPrice: { type: Number, default: 0 },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  imageUrl: String,
  mobile: String,
  stats: mongoose.Schema.Types.Mixed,
  currentTopBid: { type: Number, default: 0 },
  bids: [{
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    amount: Number,
    time: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.models.Player || mongoose.model("Player", playerSchema);