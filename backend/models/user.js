import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  mobile: { type: String, unique: true, required: true },
  email: { type: String, unique: true, sparse: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  resetOtp: String,
  resetOtpExpires: Date
}, { timestamps: true });

export default mongoose.model("User", userSchema);