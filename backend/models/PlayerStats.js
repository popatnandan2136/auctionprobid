import mongoose from "mongoose";

const playerStatsSchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  stats: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model("PlayerStats", playerStatsSchema);
