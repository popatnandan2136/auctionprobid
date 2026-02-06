import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: String,
    icon: String,
  },
  { timestamps: true }
);

export default mongoose.model("Skill", skillSchema);
