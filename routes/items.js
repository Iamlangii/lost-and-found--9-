const express = require("express")
const router = express.Router()
const Item = require("../models/Item")
const Activity = require("../models/Activity")
const { check, validationResult } = require("express-validator")

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next()
  }
  return res.status(401).json({ success: false, message: "Authentication required" })
}

// Report a lost or found item
router.post(
  "/",
  isAuthenticated,
  [
    check("name", "Item name is required").notEmpty(),
    check("category", "Category is required").isIn([
      "clothes",
      "ids",
      "phones",
      "keys",
      "books",
      "laptops",
      "documents",
      "others",
    ]),
    check("status", "Status is required").isIn(["lost", "found"]),
    check("location", "Location is required").notEmpty(),
    check("date", "Date is required").isISO8601(),
    check("description", "Description is required").notEmpty(),
    check("contactInfo", "Contact information is required").notEmpty(),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const upload = req.app.locals.upload

      upload.single("image")(req, res, async (err) => {
        if (err) {
          return res.status(400).json({ success: false, message: err.message })
        }

        const { name, category, status, location, date, description, contactInfo } = req.body

        // Create new item
        const item = new Item({
          name,
          category,
          status,
          location,
          date: new Date(date),
          description,
          contactInfo,
          user: req.session.userId,
          image: req.file ? `/uploads/${req.file.filename}` : undefined,
        })

        // Save item to database
        await item.save()

        // Create activity log
        await Activity.create({
          user: req.session.userId,
          item: item._id,
          type: status,
          description: `User ${status === "lost" ? "reported lost" : "reported found"}: ${name}`,
        })

        res.status(201).json({
          success: true,
          message: `Item ${status === "lost" ? "reported as lost" : "reported as found"} successfully`,
          item,
        })
      })
    } catch (error) {
      console.error("Report item error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
)

// Get all items with filtering
router.get("/", async (req, res) => {
  try {
    const { keyword, category, status, dateFrom, dateTo, location, limit = 20, page = 1 } = req.query

    // Build query
    const query = {}

    if (keyword) {
      query.$text = { $search: keyword }
    }

    if (category) {
      query.category = category
    }

    if (status) {
      query.status = status
    }

    if (dateFrom || dateTo) {
      query.date = {}
      if (dateFrom) {
        query.date.$gte = new Date(dateFrom)
      }
      if (dateTo) {
        query.date.$lte = new Date(dateTo)
      }
    }

    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    // Calculate pagination
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit)

    // Get items
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number.parseInt(limit))
      .populate("user", "firstName lastName")

    // Get total count
    const total = await Item.countDocuments(query)

    res.json({
      success: true,
      items,
      pagination: {
        total,
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        pages: Math.ceil(total / Number.parseInt(limit)),
      },
    })
  } catch (error) {
    console.error("Get items error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get item by ID
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate("claimedBy", "firstName lastName")

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" })
    }

    res.json({ success: true, item })
  } catch (error) {
    console.error("Get item error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Update item
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    // Find item
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" })
    }

    // Check if user owns the item
    if (item.user.toString() !== req.session.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to update this item" })
    }

    // Update allowed fields
    const { name, category, location, date, description, contactInfo } = req.body

    if (name) item.name = name
    if (category) item.category = category
    if (location) item.location = location
    if (date) item.date = new Date(date)
    if (description) item.description = description
    if (contactInfo) item.contactInfo = contactInfo

    // Save updated item
    await item.save()

    res.json({
      success: true,
      message: "Item updated successfully",
      item,
    })
  } catch (error) {
    console.error("Update item error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Mark item as claimed/returned
router.put(
  "/:id/status",
  isAuthenticated,
  [check("status", "Status is required").isIn(["claimed", "returned"])],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { status } = req.body

    try {
      // Find item
      const item = await Item.findById(req.params.id)

      if (!item) {
        return res.status(404).json({ success: false, message: "Item not found" })
      }

      // Update status
      item.status = status

      // If claimed or returned, mark as resolved and set claimedBy
      if (status === "claimed" || status === "returned") {
        item.isResolved = true
        item.claimedBy = req.session.userId
      }

      // Save updated item
      await item.save()

      // Create activity log
      await Activity.create({
        user: req.session.userId,
        item: item._id,
        type: status,
        description: `Item ${status}: ${item.name}`,
      })

      res.json({
        success: true,
        message: `Item marked as ${status} successfully`,
        item,
      })
    } catch (error) {
      console.error("Update item status error:", error)
      res.status(500).json({ success: false, message: "Server error" })
    }
  },
)

// Delete item
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    // Find item
    const item = await Item.findById(req.params.id)

    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" })
    }

    // Check if user owns the item
    if (item.user.toString() !== req.session.userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this item" })
    }

    // Delete item
    await item.remove()

    // Delete related activities
    await Activity.deleteMany({ item: req.params.id })

    res.json({ success: true, message: "Item deleted successfully" })
  } catch (error) {
    console.error("Delete item error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

// Get user's items
router.get("/user/me", isAuthenticated, async (req, res) => {
  try {
    const items = await Item.find({ user: req.session.userId }).sort({ createdAt: -1 })

    res.json({ success: true, items })
  } catch (error) {
    console.error("Get user items error:", error)
    res.status(500).json({ success: false, message: "Server error" })
  }
})

module.exports = router

