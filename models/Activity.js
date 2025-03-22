const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
  },
  type: {
    type: String,
    required: true,
    enum: ["lost", "found", "claimed", "returned", "profile_update", "password_change", "login", "register"],
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Activity = mongoose.model("Activity", activitySchema)

module.exports = Activity

