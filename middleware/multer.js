// middleware/multer.js
const multer = require("multer");
const path = require("path");

// Set storage destination and file naming convention
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // Files will be saved in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Appends timestamp to the file name
  },
});

// Initialize multer with file size limit and filter for accepted file types
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|docx|pptx|txt|jpg|png|jpeg/; // Accepted file extensions
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb("Error: Only PDF, DOCX, PPTX, TXT, JPG, PNG, JPEG files are allowed!");
    }
  },
});

module.exports = upload;
