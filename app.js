require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");  // Import auth routes
const profileRoutes = require("./routes/profile");  // Import profile routes
const fileRoutes = require("./routes/files");  // Import file routes
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-express-middleware");
const Backend = require("i18next-fs-backend");
const path = require("path");
const redis = require("redis");
const Bull = require("bull");
const indexRouter = require('./routes/index'); 
const http = require("http");  // Import HTTP server module
const socketIo = require("socket.io");  // Import Socket.io

// Initialize the Express app
const app = express();

// Create HTTP server for both Express and Socket.io
const server = http.createServer(app);

// Set up Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow all origins for testing (adjust later for production)
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Set up i18next for multilingual support
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en", // Default language
    preload: ["en", "rw", "fr"], // Preload English, Kinyarwanda, and French
    backend: {
      loadPath: path.join(__dirname, "locales", "{{lng}}", "translation.json"),
    },
  });

// Middleware to handle translations
app.use(i18nextMiddleware.handle(i18next));

// Middleware to parse JSON
app.use(express.json());

// Setup Redis and Bull for the queuing system
const fileQueue = new Bull("fileQueue", {
  redis: {
    host: "localhost",
    port: 6379,
  },
});

// Process file upload jobs and emit progress through Socket.io
fileQueue.process(async (job, done) => {
  const { fileId, filePath } = job.data;
  console.log("Processing file upload for file:", fileId);

  // Example of emitting progress updates to clients via Socket.io
  io.emit("fileUploadProgress", { fileId, status: "Processing started" });

  // Additional processing logic here (e.g., validation, file manipulation)
  
  // Emit progress update
  io.emit("fileUploadProgress", { fileId, status: "Processing in progress" });

  // Once processing is done, emit completion
  io.emit("fileUploadProgress", { fileId, status: "Processing complete" });

  done(); // Mark job as done
});

// Listen for incoming Socket.io connections
io.on("connection", (socket) => {
  console.log("A user connected");
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Use authentication routes
app.use("/api/auth", authRoutes);  // Prefix for authentication routes

// Use profile routes
app.use("/api/auth", profileRoutes);  // Prefix for profile routes

// Use file management routes
app.use("/api/files", fileRoutes);

// Handle any other routes (like index or home)
app.use('/', indexRouter);

// Start the HTTP server (using HTTP server to serve both Express and Socket.io)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
