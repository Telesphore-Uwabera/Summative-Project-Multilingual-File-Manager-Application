require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const authRoutes = require("./routes/auth");  
const profileRoutes = require("./routes/profile"); 
const fileRoutes = require("./routes/files");  
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-express-middleware");
const Backend = require("i18next-fs-backend");
const path = require("path");
const redis = require("redis");
const Bull = require("bull");
const indexRouter = require('./routes/index'); 
const http = require("http");  
const socketIo = require("socket.io");  

// Initializing the Express app
const app = express();

// Creating HTTP server for both Express and Socket.io
const server = http.createServer(app);

// Setting up Socket.io
const io = socketIo(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"]
  }
});

// Connecting to MongoDB
connectDB();

// Setting up i18next for multilingual support
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en", 
    preload: ["en", "rw", "fr"], 
    backend: {
      loadPath: path.join(__dirname, "locales", "{{lng}}", "translation.json"),
    },
  });

// Middleware to handle translations
app.use(i18nextMiddleware.handle(i18next));

// Middleware to parse JSON
app.use(express.json());

// Setting up Redis and Bull for the queuing system
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
  io.emit("fileUploadProgress", { fileId, status: "Processing started" });
  
  // Emit progress update
  io.emit("fileUploadProgress", { fileId, status: "Processing in progress" });

  // Once processing is done, emit completion
  io.emit("fileUploadProgress", { fileId, status: "Processing complete" });

  done(); 
});

// Listening for incoming Socket.io connections
io.on("connection", (socket) => {
  console.log("A user connected");
  
  // Handling disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Using authentication routes
app.use("/api/auth", authRoutes); 

// Using profile routes
app.use("/api/auth", profileRoutes);  

// Using file management routes
app.use("/api/files", fileRoutes);

// Handling any other routes (like index or home)
app.use('/', indexRouter);

// Starting the HTTP server 
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
