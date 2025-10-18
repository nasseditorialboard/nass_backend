const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user_model");


const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Sign Up Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, msg: "User already exists, please signin" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user without profile picture
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ ok: true, msg: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Failed to create user" });
  }
});



// Sign In Route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, msg: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "48h" });

    // Return the token with a standardized response
    res.status(200).json({ ok: true, msg: "Sign in successful", token });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Failed to sign in" });
  }
});

router.post("/signin/admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ ok: false, msg: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ ok: false, msg: "Access denied. Admins only." });
    }

    // Verify the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ ok: false, msg: "Invalid credentials" });
    }

    // Generate a token
    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "48h" });

    // Return the token with a standardized response
    res.status(200).json({ ok: true, msg: "Sign in successful", token });
  } catch (error) {
    res.status(500).json({ ok: false, msg: "Failed to sign in" });
  }
});


// Sign Up Route
router.post("/signup/admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if a user with the provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ ok: false, msg: "User already exists, please signin" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user without profile picture
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    });

    // Save the new user to the database
    await newUser.save();

    res.status(201).json({ ok: true, msg: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ ok: false, msg: "Failed to create user" });
  }
});

  
module.exports = router;