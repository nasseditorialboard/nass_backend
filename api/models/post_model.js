const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  tag: { type: String },
  cover_image: { type: String },
  content: { type: String, required: true },
  author: { type: String, required: true }, // Reference to User
}, { timestamps: true });

postSchema.virtual("readTime").get(function () {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = this.content.split(" ").length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return `${minutes} min read`;
});

// This will create and export the User model
const NASS_Post = mongoose.model("NASS_Posts", postSchema);
module.exports = NASS_Post;
