const express = require("express");
const Course = require("../models/course_model");
const router = express.Router();

// Create a new course
router.post("/", async (req, res) => {
  try {
    const { name, thumbnail, description } = req.body;
    const newCourse = new Course({ name, thumbnail, description });
    await newCourse.save();
    res.status(201).json({ ok: true, msg: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Failed to create course" });
  }
});

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ ok: true, msg: "Courses fetched successfully", courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Failed to fetch courses" });
  }
});

// Get a single course
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ ok: false, msg: "Course not found" });
    res.status(200).json({ ok: true, msg: "Course fetched successfully", course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Failed to fetch course" });
  }
});

// Update a course
router.put("/:id", async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) return res.status(404).json({ ok: false, msg: "Course not found" });
    res.status(200).json({ ok: true, msg: "Course updated successfully", course: updatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Failed to update course" });
  }
});

// Delete a course
router.delete("/:id", async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) return res.status(404).json({ ok: false, msg: "Course not found" });
    res.status(200).json({ ok: true, msg: "Course deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, msg: "Failed to delete course" });
  }
});

module.exports = router;
