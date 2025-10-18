const express = require("express");
const router = express.Router();
const User = require ('../models/user_model');
const multer = require("multer");
const authenticate = require("../middlewares/authenticate");
const Utils = require("../utils/utils");
//const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // Limit file size to 5MB

// Profile Picture Upload Route
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });
 // Limit file size to 5MB

// Profile Picture Upload Route
router.post(
  "/upload-profile-picture",
  authenticate,
  upload.single("image"),
  async (req, res) => {
    try {
      // Ensure req.user is populated by authentication middleware
      if (!req.user || !req.user.id) {
        return res.status(401).json({ ok: false, msg: "Unauthorized request" });
      }

      const userId = req.user.id;

      // Check if file exists
      if (!req.file) {
        return res.status(400).json({ ok: false, msg: "No file uploaded" });
      }

      // Upload the image (Ensure Utils.upload is properly implemented)
      const result = await Utils.upload(req.file.buffer, "profile-images");

      if (!result || !result.secure_url) {
        return res.status(500).json({ ok: false, msg: "Upload failed" });
      }

      // Update user profile image
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profile_image: result.secure_url },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ ok: false, msg: "User not found" });
      }

      res.status(200).json({
        ok: true,
        msg: "Profile picture uploaded successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res.status(500).json({ ok: false, msg: "Failed to upload profile picture" });
    }
  }
);

module.exports = router;
