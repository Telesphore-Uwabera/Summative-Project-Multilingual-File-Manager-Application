const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const File = require("../models/File");
const Submission = require("../models/Submissions"); 

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connecting to the in-memory database
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Stopping the in-memory MongoDB server after all tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Submission Model Tests", () => {
  let userObj, fileObj;

  beforeEach(async () => {
    // Creating a user and a file before each test 
    userObj = await User.create({ name: "Jane Doe", email: "jane.doe@example.com" });
    fileObj = await File.create({
      name: "assignment1.pdf",
      path: "/files/assignment1.pdf",
      classId: new mongoose.Types.ObjectId(),
      userId: userObj._id,
      type: "assignment",
    });
  });

  afterEach(async () => {
    // Cleaning up after each test
    await Submission.deleteMany({});
    await User.deleteMany({});
    await File.deleteMany({});
  });

  test("should create a new submission", async () => {
    const submissionData = {
      student: userObj._id,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment1.pdf",
      grade: 90,
      feedback: "Great job!",
    };

    const submission = await Submission.create(submissionData);

    // Checking if the submission was created successfully
    expect(submission).toBeDefined();
    expect(submission.student.toString()).toBe(userObj._id.toString());
    expect(submission.assignment.toString()).toBe(fileObj._id.toString());
    expect(submission.file).toBe(submissionData.file);
    expect(submission.grade).toBe(submissionData.grade);
    expect(submission.feedback).toBe(submissionData.feedback);
  });

  test("should throw an error if required fields are missing", async () => {
    const submissionData = {
      student: userObj._id, // Missing assignment and file fields
    };

    try {
      await Submission.create(submissionData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.assignment).toBeDefined();
      expect(error.errors.file).toBeDefined();
    }
  });

  test("should handle optional fields", async () => {
    const submissionData = {
      student: userObj._id,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment1.pdf",
    };

    const submission = await Submission.create(submissionData);

    expect(submission.grade).toBeNull(); 
    expect(submission.feedback).toBe(""); 
  });

  test("should query submissions by student", async () => {
    await Submission.create({
      student: userObj._id,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment1.pdf",
    });
    await Submission.create({
      student: userObj._id,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment2.pdf",
    });

    const submissions = await Submission.find({ student: userObj._id });

    // Ensuring that submissions for the given student are returned
    expect(submissions.length).toBe(2);
    expect(submissions[0].student.toString()).toBe(userObj._id.toString());
    expect(submissions[1].student.toString()).toBe(userObj._id.toString());
  });

  test("should query submissions by assignment", async () => {
    await Submission.create({
      student: userObj._id,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment1.pdf",
    });
    await Submission.create({
      student: userObj._id,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment2.pdf",
    });

    const submissions = await Submission.find({ assignment: fileObj._id });

    // Ensuring that submissions for the given assignment are returned
    expect(submissions.length).toBe(2);
    expect(submissions[0].assignment.toString()).toBe(fileObj._id.toString());
    expect(submissions[1].assignment.toString()).toBe(fileObj._id.toString());
  });

  test("should throw an error if an invalid ObjectId is used", async () => {
    const invalidUserId = "12345"; 
    const submissionData = {
      student: invalidUserId,
      assignment: fileObj._id,
      file: "/submissions/jane/assignment1.pdf",
    };

    try {
      await Submission.create(submissionData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("CastError");
    }
  });
});
