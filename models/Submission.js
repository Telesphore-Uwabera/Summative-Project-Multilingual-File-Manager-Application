const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
  file: { type: String, required: true }, // Path to the submission file
  grade: { type: Number, default: null }, // Optional grading feature
  feedback: { type: String, default: "" }, // Optional feedback from teacher
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
