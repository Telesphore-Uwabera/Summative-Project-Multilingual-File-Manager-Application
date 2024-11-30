const express = require('express');
const fs = require('fs');
const multer = require('multer');
const authMiddleware = require('../middleware/authMiddleware');
const File = require('../models/File');
const Submission = require('../models/Submissions');
const Class = require('../models/Class');
const uploadQueue = require('../queue');  // Import the queue
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
    const classId = req.body.classId || 'general';
    const dir = `./uploads/${classId}`;
    fs.mkdirSync(dir, { recursive: true }); // Create class directory if it doesn't exist
    cb(null, dir); // Save file in the class directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique file name
  },
});
const upload = multer({ storage });

// ------------------- Teacher Functionality ------------------- //

// 1. Create a new class directory (also creates a class in DB)
router.post('/class', authMiddleware, isTeacher, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Class name is required' });
  }

  try {
    const newClass = new Class({
      name,
      teacher: req.user._id, // The teacher creating the class
    });

    // Create the directory on the server to store class materials
    const dir = `./uploads/${newClass._id}`;
    fs.mkdirSync(dir, { recursive: true });

    await newClass.save();
    res.status(201).json({ msg: 'Class created successfully', class: newClass });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 2. Teacher uploads files/resources with a deadline
router.post('/upload', authMiddleware, isTeacher, upload.single('file'), async (req, res) => {
  const { name, classId, type, deadline } = req.body;

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
      deadline: deadline ? new Date(deadline) : null, // Assign deadline if provided
    });

    await newFile.save();

    // Add the file upload to the queue for background processing (e.g., validation)
    uploadQueue.add({
      fileId: newFile._id,
      filePath: newFile.path
    });

    res.status(201).json({ msg: 'File uploaded successfully', file: newFile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 3. Teacher updates file metadata including deadline
router.put('/:fileId', authMiddleware, isTeacher, async (req, res) => {
  const { name, type, deadline } = req.body;

  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

    if (file.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'You are not authorized to update this file' });
    }

    // Update fields
    file.name = name || file.name;
    file.type = type || file.type;
    if (deadline) file.deadline = new Date(deadline);

    await file.save();
    res.status(200).json({ msg: 'File updated successfully', file });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 4. Teacher deletes a file
router.delete('/:fileId', authMiddleware, isTeacher, async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ msg: 'File not found' });
    }

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

// 5. View materials available for a student's enrolled classes
router.get('/materials/:classId', authMiddleware, async (req, res) => {
  const classId = req.params.classId;

  try {
    const userClasses = req.user.classes || []; // assuming classes field in User schema
    if (!userClasses.includes(classId)) {
      return res.status(403).json({ msg: 'Access denied: You are not enrolled in this class' });
    }

    const files = await File.find({ classId });

    if (files.length === 0) {
      return res.status(404).json({ msg: 'No materials found for this class' });
    }

    res.status(200).json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// ------------------- Student Functionality ------------------- //

// 6. Student can submit assignments to a class
router.post('/submit/:classId', authMiddleware, upload.single('assignment'), async (req, res) => {
  const classId = req.params.classId;
  const { assignmentFile } = req.body;

  if (!assignmentFile) {
    return res.status(400).json({ msg: 'No assignment file provided' });
  }

  try {
    const userClasses = req.user.classes || []; // assuming classes field in User schema

    if (!userClasses.includes(classId)) {
      return res.status(403).json({ msg: 'Access denied: You are not enrolled in this class' });
    }

    const newSubmission = new Submission({
      student: req.user._id,
      assignment: assignmentFile.originalname,
      file: req.file.path,
      classId,
    });

    await newSubmission.save();

    // Enqueue submission processing (validation, etc.)
    uploadQueue.add({
      fileId: newSubmission._id,
      filePath: newSubmission.file
    });

    res.status(201).json({ msg: 'Assignment submitted successfully', submission: newSubmission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 7. View submissions for a class
router.get('/submissions/student/:classId', authMiddleware, async (req, res) => {
  const classId = req.params.classId;

  try {
    const userClasses = req.user.classes || []; // assuming classes field in User schema
    if (!userClasses.includes(classId)) {
      return res.status(403).json({ msg: 'Access denied: You are not enrolled in this class' });
    }

    const submissions = await Submission.find({ classId, student: req.user._id })
      .populate('assignment', 'name') // Populate the assignment file name
      .populate('student', 'name email');

    res.status(200).json({ submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// 8. Teacher grades student submissions
router.put('/grade/:submissionId', authMiddleware, isTeacher, async (req, res) => {
  const { grade, feedback } = req.body;

  if (grade === undefined) {
    return res.status(400).json({ msg: 'Grade is required' });
  }

  try {
    const submission = await Submission.findById(req.params.submissionId);

    if (!submission) {
      return res.status(404).json({ msg: 'Submission not found' });
    }

    if (submission.classId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'You are not authorized to grade this submission' });
    }

    // Update grading fields
    submission.grade = grade;
    submission.feedback = feedback || '';

    await submission.save();
    res.status(200).json({ msg: 'Submission graded successfully', submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
