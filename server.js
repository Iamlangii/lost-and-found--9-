const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const session = require("express-session")
const MongoStore = require("connect-mongo")
const dotenv = require("dotenv")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const { v4: uuidv4 } = require("uuid")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const userRoutes = require("./routes/users")
const itemRoutes = require("./routes/items")

// Create Express app
const app = express()
const PORT = process.env.PORT || 3000

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/lost_and_found")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err))

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/lost_and_found",
      ttl: 14 * 24 * 60 * 60, // 14 days
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
      secure: process.env.NODE_ENV === "production",
    },
  }),
)

// Configure file uploads
// For Vercel, we need to use in-memory storage instead of disk storage
const storage =
  process.env.NODE_ENV === "production"
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, path.join(__dirname, "public/uploads"))
        },
        filename: (req, file, cb) => {
          const uniqueFilename = `${uuidv4()}-${file.originalname}`
          cb(null, uniqueFilename)
        },
      })

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed!"), false)
    }
  },
})

// Make upload available globally
app.locals.upload = upload

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/items", itemRoutes)

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"))
  })
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

// For Vercel serverless functions, we need to export the app
if (process.env.NODE_ENV === "production") {
  module.exports = app
} else {
  // Start server for local development
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

