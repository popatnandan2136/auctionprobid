import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  pointsPerTeam: Number,
  maxPlayersPerTeam: Number,
  minPlayersPerTeam: Number,
  incrementSteps: [Number],
  auctionDate: Date,
  totalTeams: Number,
  currentPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  auctionType: { type: String, enum: ["WITH_STATS", "WITHOUT_STATS"] },
  enabledStats: [{ key: String, label: String, dataType: String, required: Boolean }],
  customCategories: [String],
  customRoles: [String],
  status: { type: String, enum: ["NOT_STARTED", "LIVE", "FINISHED"], default: "NOT_STARTED" },
  isLive: { type: Boolean, default: false },
  isRegistrationOpen: { type: Boolean, default: true },
  lastBidTime: { type: Date, default: Date.now },
  sponsors: [{
    name: String,
    logoUrl: String,
    mobile: String,
    address: String,
    website: String
  }]
}, { timestamps: true });

<<<<<<< HEAD

module.exports = mongoose.model("Auction", auctionSchema);
export default mongoose.models.Auction || mongoose.model("Auction", auctionSchema);
=======
<<<<<<< HEAD
export default mongoose.models.Auction || mongoose.model("Auction", auctionSchema);
=======
module.exports = mongoose.model("Auction", auctionSchema);
>>>>>>> f0509fe1f3935a3dbe2d7691c1e0611307b6635d
>>>>>>> 60bbd6055756e9b22c16fb1c5e161e320a17b977
