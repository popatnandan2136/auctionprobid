import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
     name: String,
    icon: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model('Category', auctionSchema);