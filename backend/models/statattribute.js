import mongoose from 'mongoose';

const statAttributeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
    unique: true,
  },
  dataType: {
    type: String,
    enum: ["Number", "String"],
    default: "Number",
  },
},
  { timestamps: true }
);

export default mongoose.model("StatAttribute", statAttributeSchema);
