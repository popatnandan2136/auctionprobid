import mongoose from "mongoose";

const playerRequestSchema = new mongoose.Schema({
  mobile: String,
  otp: String,
  auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction" },
  name: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  basePrice: Number,
  stats: mongoose.Schema.Types.Mixed,
  status: { type: String, enum: ["OTP_SENT", "SUBMITTED", "APPROVED"] }
}, { timestamps: true });

export default mongoose.model("PlayerRequest", playerRequestSchema);
