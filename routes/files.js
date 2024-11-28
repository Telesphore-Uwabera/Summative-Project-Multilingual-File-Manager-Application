const express = require('express');
const multer = require('multer'); // Assuming Multer for file uploads
const authMiddleware = require('../middleware/authMiddleware');
const File = require('../models/File');  // Your File model
const User = require('../models/User');  // Your User model
const router = express.Router();

// Middleware to check if user is a teacher
const isTeacher = (req, res, next) => {
  if (req.user.role !== 'teacher') {
    return res.status(403).json({ msg: 'Access denied: Teacher only' });
  }
  next();
};

// Set up file storage configuration for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');  // Folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Unique file name
  },
});
const upload = multer({ storage });

// Teacher can upload files
router.post('/upload', authMiddleware, isTeacher, upload.single('file'), async (req, res) => {
  const { name, classId, type } = req.body;

  if (!name || !classId || !type) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    const newFile = new File({
      name,
      classId,
      type,
      userId: req.user._id, // Linking the file with the teacher
      path: req.file.path,  // Storing the file path
    });

    await newFile.save();
    res.status(201).json({ msg: 'File uploaded successfully', file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Teacher can update a file's metadata
router.put('/:fileId', authMiddleware, isTeacher, async (req, res) => {
  const { type, name } = req.body;

  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // Ensure that the user is the one who uploaded the file (teacher)
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'You are not authorized to update this file' });
    }

    file.type = type || file.type;
    file.name = name || file.name;

    await file.save();
    res.status(200).json({ msg: 'File updated successfully', file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Teacher can delete a file
router.delete('/:fileId', authMiddleware, isTeacher, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    // Ensure that the user is the one who uploaded the file (teacher)
    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'You are not authorized to delete this file' });
    }

    await File.findByIdAndDelete(req.params.fileId);

    res.status(200).json({ msg: 'File deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student can view files for a specific class
router.get('/:classId', authMiddleware, async (req, res) => {
  const classId = req.params.classId;

  try {
    // Check if the user is enrolled in this class
    const userClasses = req.user.classes || [];  // assuming classes field in User schema
    if (!userClasses.includes(classId)) {
      return res.status(403).json({ msg: 'Access denied: You are not enrolled in this class' });
    }

    const files = await File.find({ classId });

    if (files.length === 0) {
      return res.status(404).json({ msg: 'No files found for this class' });
    }

    res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Student can submit assignments to a class
router.post('/submit/:classId', authMiddleware, upload.single('assignment'), async (req, res) => {
  const classId = req.params.classId;
  const { assignmentFile } = req.body;

  if (!assignmentFile) {
    return res.status(400).json({ msg: 'No assignment file provided' });
  }

  try {
    const userClasses = req.user.classes || []; // assuming classes field in User schema

    // Check if the user is enrolled in the class
    if (!userClasses.includes(classId)) {
      return res.status(403).json({ msg: 'Access denied: You are not enrolled in this class' });
    }

    const newSubmission = new File({
      name: assignmentFile.originalname,
      path: req.file.path,
      type: 'assignment',
      classId,
      userId: req.user._id,
    });

    await newSubmission.save();
    res.status(201).json({ msg: 'Assignment submitted successfully', submission: newSubmission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
