const express = require('express');
const multer = require("multer");
const Utils = require("../utils/utils");
const router = express.Router(); 
const Department = require('../models/department_model');
const mongoose = require("mongoose");
const authenticate = require("../middlewares/authenticate");


// Create a new department
router.post("/", authenticate, async (req, res) => {
    try {
      const { name, description, executives } = req.body;
  
      // Create and save the department
      const department = new Department({ name, description, executives });
      await department.save();
  
      res.status(201).json({ ok: true, msg: "Department created successfully", department });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Failed to create department", error });
    }
  });



  // Update executives of a department
router.post("/:id/executives", authenticate, async (req, res) => {
    try {
      const { executives } = req.body;
  
      const department = await Department.findByIdAndUpdate(
        req.params.id,
        { executives },
        { new: true, runValidators: true } // Return updated document and validate inputs
      );
  
      if (!department) {
        return res.status(404).json({ ok: false, msg: "Department not found" });
      }
  
      res.status(200).json({ ok: true, msg: "Executives updated successfully", department });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Failed to update executives", error });
    }
  });

  

  // Get all departments
router.get("/", async (req, res) => {
    try {
      const departments = await Department.find().sort({ createdAt: -1 });
      res.status(200).json({ ok: true, msg: "Departments fetched successfully", departments });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Failed to fetch departments", error });
    }
  });
  
  // Get a single department by ID
  router.get("/find/:id", async (req, res) => {
    try {

      const department = await Department.findById(req.params.id);
      if (!department) {
        return res.status(404).json({ ok: false, msg: "Department not found" });
      }
      res.status(200).json({ ok: true, msg: "Department fetched successfully", department });
    } catch (error) {
      console.error(error);
      res.status(500).json({ ok: false, msg: "Failed to fetch department", error });
    }
  });



  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6 * 1024 * 1024 } });

  // Upload executive profile picture (authenticated user)
  router.post("/upload/executives/profile-picture", upload.single("image"), async (req, res) => {
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


//-------------------------------------------------------------------------------------

router.get("/activities", async (req, res) => {
  try {
    const { department_Id } = req.query; // Ensure the client is sending this in query params

    if (!department_Id) {
      return res.status(400).json({ ok: false, msg: "Department ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(department_Id)) {
      return res.status(400).json({ ok: false, msg: "Invalid department ID format" });
    }

    const department = await Department.findById(department_Id);
    if (!department) {
      return res.status(404).json({ ok: false, msg: "Department not found" });
    }

    res.json({ ok: true, activities: department.activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ ok: false, msg: "Error fetching activities" });
  }
});


router.post("/activities/add-activity", async (req, res) => {
  try {
    const { department_Id, title } = req.body;

    if (!department_Id || !title) {
      return res.status(400).json({ ok: false, msg: "Department ID and Activity title are required" });
    }

    const department = await Department.findById(department_Id);
    if (!department) {
      return res.status(404).json({ ok: false, msg: "Department not found" });
    }

    department.activities.push({ title, approved: false });
    await department.save();

    res.status(201).json({ ok: true, msg: "Activity added successfully", activities: department.activities });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error adding activity" });
  }
});


router.post("/activities/approve", async (req, res) => {
  try {
    const { activity_Id, department_Id } = req.body;

    if (!activity_Id || !department_Id) {
      return res.status(400).json({ ok: false, msg: "Activity ID and Department ID are required" });
    }

    const department = await Department.findById(department_Id);
    if (!department) {
      return res.status(404).json({ ok: false, msg: "Department not found" });
    }

    
    const activity = department.activities.find(activity => activity._id.toString() === activity_Id);
    if (!activity) {
      return res.status(404).json({ ok: false, msg: "Activity not found" });
    }

    activity.approved = true;
    await department.save();

    res.json({ ok: true, msg: "Activity approved successfully", activities: department.activities });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Error approving activity" });
  }
});


router.delete("/activities/delete", async (req, res) => {
  try {
    const { activity_Id, department_Id } = req.body;

    if (!activity_Id || !department_Id) {
      return res.status(400).json({ ok: false, msg: "Activity ID and Department ID are required" });
    }

    const department = await Department.findById(department_Id);
    if (!department) {
      return res.status(404).json({ ok: false, msg: "Department not found" });
    }

    const activityIndex = department.activities.findIndex(activity => activity._id.toString() === activity_Id);
    if (activityIndex === -1) {
      return res.status(404).json({ ok: false, msg: "Activity not found" });
    }

    department.activities.splice(activityIndex, 1);
    await department.save();

    res.json({ ok: true, msg: "Activity deleted successfully", activities: department.activities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Error deleting activity" });
  }
});

module.exports = router;




  module.exports = router;