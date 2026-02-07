const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["MASTER_ADMIN", "ADMIN", "TEAM", "PLAYER"], required: true },
  status: { type: String, enum: ["ACTIVE", "DEACTIVATED"], default: "ACTIVE" },
  teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resetOtp: String,
  resetOtpExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);