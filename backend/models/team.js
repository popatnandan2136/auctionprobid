import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
  name: String,
  logoUrl: String,
  ownerName: String,
  ownerEmail: String,
  ownerMobile: String,
  totalPoints: { type: Number, default: 0 },
  spentPoints: { type: Number, default: 0 },
  availablePoints: { type: Number, default: 0 },
  playersBought: { type: Number, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Team", teamSchema);