require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");  // Import auth routes
const profileRoutes = require("./routes/profile");  // Import profile routes
const fileRoutes = require("./routes/files");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Use authentication routes
app.use("/api/auth", authRoutes);  // Prefix for authentication routes

// Use profile routes
app.use("/api/auth", profileRoutes);  // Prefix for profile routes

// Use the file management routes
app.use("/api/files", fileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
