const express = require('express');
const router = express.Router();
const User = require('../models/user_model');
const authenticate = require('../middlewares/authenticate');

// Fetch User Profile Route
router.get("/user-profile", authenticate, async (req, res) => {
  try {
    // Get the user ID from the authenticated request (from the JWT token)
    const userId = req.user.id;

    // Fetch the user data from the database
    const user = await User.findById(userId).select("-password"); // Exclude password from response

    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    // If profilePicture exists, return it as a Base64 string
    const userProfile = {
      ...user.toObject(),
      profilePicture: user.profilePicture ? user.profilePicture : null,
    };

    res.status(200).json({ ok: true, msg: "User profile fetched successfully", user: userProfile });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Failed to fetch user profile" });
  }
});

module.exports = router;
