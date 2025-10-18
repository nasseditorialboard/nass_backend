const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "editor"], required: true },
  profile_image: { type: String }, // Base64 encoded string
});

// This will create and export the User model
const NASS_User = mongoose.model("NASS_User", userSchema);

module.exports = NASS_User;