const express = require("express")
const router = express.Router()
const User = require("../models/User")
const Activity = require("../models/Activity")
const Item = require("../models/Item")
const { check, validationResult } = require("express-validator")

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next()
  }
  return res.status(401).json({ success: false, message: "Authentication required" })
}

// Get user profile
router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }
    res.json({ success: true, user: user.getPublicProfile() })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Update user profile
router.put(
  "/profile",
  isAuthenticated,
  [
    check("firstName", "First name is required").notEmpty(),
    check("lastName", "Last name is required").notEmpty(),
    check("email", "Please include a valid email").isEmail(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { firstName, lastName, email, phone, location } = req.body

    try {
      // Check if email is already in use by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.session.userId } })
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Email is already in use" })
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        req.session.userId,
        { firstName, lastName, email, phone, location },
        { new: true, runValidators: true },
      )

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      // Create activity log
      await Activity.create({
        user: user._id,
        type: "profile_update",
        description: "User updated profile",
      })

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: user.getPublicProfile(),
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
)

// Update profile picture
router.post("/profile-picture", isAuthenticated, async (req, res) => {
  try {
    const upload = req.app.locals.upload

    upload.single("profilePicture")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message })
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" })
      }

      const profilePicturePath = `/uploads/${req.file.filename}`

      // Update user
      const user = await User.findByIdAndUpdate(
        req.session.userId,
        { profilePicture: profilePicturePath },
        { new: true },
      )

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" })
      }

      res.json({
        success: true,
        message: "Profile picture updated successfully",
        profilePicture: profilePicturePath,
      })
    })
  } catch (error) {
    console.error("Update profile picture error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Update notification settings
router.put("/notification-settings", isAuthenticated, async (req, res) => {
  const { email, push, itemMatch, weeklyDigest } = req.body

  try {
    const user = await User.findByIdAndUpdate(
      req.session.userId,
      {
        "notificationSettings.email": email,
        "notificationSettings.push": push,
        "notificationSettings.itemMatch": itemMatch,
        "notificationSettings.weeklyDigest": weeklyDigest,
      },
      { new: true },
    )

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({
      success: true,
      message: "Notification settings updated successfully",
      notificationSettings: user.notificationSettings,
    })
  } catch (error) {
    console.error("Update notification settings error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Toggle two-factor authentication
router.put("/two-factor", isAuthenticated, async (req, res) => {
  const { enabled } = req.body

  try {
    const user = await User.findByIdAndUpdate(req.session.userId, { twoFactorEnabled: enabled }, { new: true })

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    res.json({
      success: true,
      message: `Two-factor authentication ${enabled ? "enabled" : "disabled"} successfully`,
      twoFactorEnabled: user.twoFactorEnabled,
    })
  } catch (error) {
    console.error("Toggle two-factor error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get user activity
router.get("/activity", isAuthenticated, async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.session.userId })
      .sort({ createdAt: -1 })
      .populate("item")
      .limit(20)

    // Get statistics
    const lostCount = await Item.countDocuments({
      user: req.session.userId,
      status: "lost",
    })

    const foundCount = await Item.countDocuments({
      user: req.session.userId,
      status: "found",
    })

    const recoveredCount = await Item.countDocuments({
      user: req.session.userId,
      $or: [{ status: "claimed" }, { status: "returned" }],
    })

    res.json({
      success: true,
      activities,
      stats: {
        lost: lostCount,
        found: foundCount,
        recovered: recoveredCount,
      },
    })
  } catch (error) {
    console.error("Get activity error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Delete account
router.delete("/account", isAuthenticated, async (req, res) => {
  try {
    // Delete user's items
    await Item.deleteMany({ user: req.session.userId })

    // Delete user's activities
    await Activity.deleteMany({ user: req.session.userId })

    // Delete user
    await User.findByIdAndDelete(req.session.userId)

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err)
      }
      res.clearCookie("connect.sid")
      res.json({ success: true, message: "Account deleted successfully" })
    })
  } catch (error) {
    console.error("Delete account error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router

