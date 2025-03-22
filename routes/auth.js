const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Activity = require("../models/Activity")
const { check, validationResult } = require("express-validator")

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next()
  }
  return res.status(401).json({ success: false, message: "Authentication required" })
}

// Register a new user
router.post(
  "/register",
  [
    // Validation
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password must be at least 8 characters long").isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { firstName, lastName, email, password } = req.body

    try {
      // Check if user already exists
      let user = await User.findOne({ email })
      if (user) {
        return res.status(400).json({ success: false, message: "User already exists" })
      }

      // Create new user
      user = new User({
        firstName,
        lastName,
        email,
        password,
      })

      // Save user to database
      await user.save()

      // Create activity log
      await Activity.create({
        user: user._id,
        type: "register",
        description: "User registered",
      })

      // Set session
      req.session.userId = user._id

      // Return success response
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: user.getPublicProfile(),
      })
    } catch (error) {
      console.error("Registration error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
)

// Login user
router.post(
  "/login",
  [check("email", "Please include a valid email").isEmail(), check("password", "Password is required").exists()],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { email, password } = req.body

    try {
      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ success: false, message: "Invalid credentials" })
      }

      // Check password
      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Invalid credentials" })
      }

      // Create activity log
      await Activity.create({
        user: user._id,
        type: "login",
        description: "User logged in",
      })

      // Set session
      req.session.userId = user._id

      // Return success response
      res.json({
        success: true,
        message: "Login successful",
        user: user.getPublicProfile(),
      })
    } catch (error) {
      console.error("Login error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
)

// Logout user
router.post("/logout", isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Could not log out" })
    }
    res.clearCookie("connect.sid")
    res.json({ success: true, message: "Logged out successfully" })
  })
})

// Check if user is authenticated
router.get("/check", (req, res) => {
  if (req.session.userId) {
    return res.json({ success: true, isAuthenticated: true })
  }
  return res.json({ success: true, isAuthenticated: false })
})

// Get current user
router.get("/me", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.json({ success: true, user: user.getPublicProfile() })
  } catch (error) {
    console.error("Get current user error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Change password
router.post(
  "/change-password",
  isAuthenticated,
  [
    check("currentPassword", "Current password is required").exists(),
    check("newPassword", "New password must be at least 8 characters long").isLength({ min: 8 }),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body

    try {
      // Find user
      const user = await User.findById(req.session.userId)
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      // Check current password
      const isMatch = await user.comparePassword(currentPassword)
      if (!isMatch) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" })
      }

      // Update password
      user.password = newPassword
      await user.save()

      // Create activity log
      await Activity.create({
        user: user._id,
        type: "password_change",
        description: "User changed password",
      })

      res.json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      console.error("Change password error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
)

module.exports = router

