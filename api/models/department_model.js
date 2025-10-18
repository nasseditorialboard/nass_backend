const mongoose = require("mongoose");

const executiveSchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true }, // Auto-generate ID for each executive
    name: { type: String, required: true, trim: true },
    profile_image: { type: String },
    email: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
  },
  { _id: false } // Ensures that Mongoose still auto-generates IDs
);

// Define schema for activities
const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: false },
  },
);

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    thumbnail: {
      type: String,
    },
    description: {
      type: String,
      trim: true,
    },
    executives: [executiveSchema], // Embed executives schema
    activities: [activitySchema], // Embed activities schema
  },
  { timestamps: true }
);

const Department = mongoose.model("NASS_Department", departmentSchema);

module.exports = Department;
