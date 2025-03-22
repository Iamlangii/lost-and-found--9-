const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["clothes", "ids", "phones", "keys", "books", "laptops", "documents", "others"],
    },
    status: {
      type: String,
      required: true,
      enum: ["lost", "found", "claimed", "returned"],
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
    },
    contactInfo: {
      type: String,
      required: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Create text index for search
itemSchema.index({
  name: "text",
  description: "text",
  location: "text",
})

const Item = mongoose.model("Item", itemSchema)

module.exports = Item

