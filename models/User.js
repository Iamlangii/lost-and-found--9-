const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: "/uploads/default-profile.jpg",
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    connectedAccounts: {
      google: {
        connected: { type: Boolean, default: false },
        accountId: { type: String },
      },
      facebook: {
        connected: { type: Boolean, default: false },
        accountId: { type: String },
      },
    },
    notificationSettings: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      itemMatch: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false },
    },
    passwordLastChanged: {
      type: Date,
      default: Date.now,
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

// Add indexes for better performance
userSchema.index({ createdAt: -1 });

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  

  // Only hash the password if it's modified or new
  if (!this.isModified("password")) return next()

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10)

    // Hash password
    this.password = await bcrypt.hash(this.password, salt)

    // Update passwordLastChanged date
    if (this.isModified("password")) {
      this.passwordLastChanged = Date.now()
    }

    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to get user's full name
userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`
}

// Method to get user's public profile
userSchema.methods.getPublicProfile = function () {
  const userObject = this.toObject()

  // Remove sensitive information
  delete userObject.password

  return userObject
}

const User = mongoose.model("User", userSchema)

module.exports = User

