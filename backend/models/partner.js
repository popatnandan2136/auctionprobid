import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ["OWNER", "PARTNER"],
      default: "OWNER",
    },
    name: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
      mobile: {
      type: String,
      required: true,
    },

    website: {
      type: String,
      default: "",
    },
     order: {
      type: Number,
      default: 0,
    },

    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Partner", partnerSchema);