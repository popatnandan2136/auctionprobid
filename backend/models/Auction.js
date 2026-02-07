const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    name: String,
    logoUrl: String,

    pointsPerTeam: Number,
    maxPlayersPerTeam: Number,

    auctionDate: Date,
    totalTeams: Number,

    status: {
      type: String,
      enum: ["NOT_STARTED", "LIVE", "FINISHED"],
      default: "NOT_STARTED",
    },

    isLive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
