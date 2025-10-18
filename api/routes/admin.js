const express = require("express");
const router = express.Router();
const User = require("../models/user_model");
const authenticate = require("../middlewares/authenticate");



const SPECIAL_ADMIN_1 = process.env.SPECIAL_ADMIN_1;
const SPECIAL_ADMIN_2 = process.env.SPECIAL_ADMIN_2;

// List of special admins who cannot be stripped of their admin role
const SPECIAL_ADMINS = [SPECIAL_ADMIN_1, SPECIAL_ADMIN_2];


// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    console.log(req.user.email)
  if (req.user.role !== "admin") {
    return res.status(403).json({ ok: false, msg: "Access denied. Admins only." });
  }
  next();
};

// Route to promote an editor to admin based on email
router.post("/admin/add", authenticate, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ ok: false, msg: "Email is required" });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    // Ensure the user is an editor before promoting
    if (user.role === "admin") {
      return res.status(400).json({ ok: false, msg: "User is already an admin" });
    }

    // Update role
    user.role = "admin";
    await user.save();

    res.status(200).json({ ok: true, msg: "Admin added successfully", user });
  } catch (error) {
    console.error("Error promoting user:", error);
    res.status(500).json({ ok: false, msg: "Failed to promote user" });
  }
});



// Strip an admin of their admin role (except special cases)
router.post("/admin/remove", authenticate, isAdmin, async (req, res) => {
    try {
      const { email } = req.body;
  
      if (!email) {
        return res.status(400).json({ ok: false, msg: "Email is required" });
      }
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ ok: false, msg: "User not found" });
      }
  
      // Prevent demoting self
      if (user.email === req.user.email) {
        return res.status(400).json({ ok: false, msg: "You cannot remove your own admin role" });
      }
  
      // Prevent demoting special admins
      if (SPECIAL_ADMINS.includes(user.email)) {
        return res.status(403).json({ ok: false, msg: "This user is a protected admin and cannot be demoted" });
      }
  
      // Ensure the user is actually an admin before demoting
      if (user.role !== "admin") {
        return res.status(400).json({ ok: false, msg: "User is not an admin" });
      }
  
      // Demote the user to editor
      user.role = "editor";
      await user.save();
  
      res.status(200).json({ ok: true, msg: "Admin removed successfully", user });
    } catch (error) {
      console.error("Error demoting user:", error);
      res.status(500).json({ ok: false, msg: "Failed to demote user" });
    }
  });


module.exports = router;
