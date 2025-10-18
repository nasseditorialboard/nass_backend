const express = require("express");
const multer = require("multer");
const Utils = require("../utils/utils");
const Department = require("../models/department_model");
const authenticate = require("../middlewares/authenticate"); // Middleware to get the user

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload executive profile picture (authenticated user)
router.post("/upload/executive/profile-picture", upload.single("image"), async (req, res) => {
  try {

    console.log(req.body)

    const { department_Id, executive_Id } = req.body; // Get department & executive IDs

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // Upload image to Cloudinary
    const result = await Utils.upload(req.file.buffer, "executives-profile");

    // Find the department by name
    const department = await Department.findById(department_Id);
    if (!department) return res.status(404).json({ success: false, message: "Department not found" });

    // Find the specific executive in the department and update their profile_picture
    const executive = department.executives.find(exec => exec._id.toString() === executive_Id);
    if (!executive) return res.status(404).json({ success: false, message: "Executive not found in department" });

    executive.profile_picture = result.secure_url;
    await Department.findOneAndUpdate(
        { _id: department_Id, "executives._id": executive_Id },
        { $set: { "executives.$.profile_image": result.secure_url } },
        { new: true }
      );

    res.json({ success: true, msg: "Profile picture updated", imageUrl: result.secure_url });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

module.exports = router;
