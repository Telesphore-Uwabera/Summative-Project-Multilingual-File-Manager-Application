const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    path: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["resource", "assignment"], required: true },
    deadline: { type: Date, default: null }, // Deadline for assignments
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
