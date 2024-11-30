// file.test.js
const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../app"); // assuming your Express app is in app.js
const File = require("../models/File"); // adjust path if needed
const Class = require("../models/Class");
const User = require("../models/User");

let mongoServer;

beforeAll(async () => {
  // Start an in-memory MongoDB server before all tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  // Stop the in-memory MongoDB server after all tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("File Model Tests", () => {
  let classObj, userObj;

  beforeEach(async () => {
    // Create a class and user before each test to use in the File model
    classObj = await Class.create({ name: "Math 101", teacher: new mongoose.Types.ObjectId() });
    userObj = await User.create({ name: "John Doe", email: "john.doe@example.com" });
  });

  afterEach(async () => {
    // Clean up after each test
    await File.deleteMany({});
    await Class.deleteMany({});
    await User.deleteMany({});
  });

  test("should create a new File", async () => {
    const fileData = {
      name: "lecture_notes.pdf",
      path: "/files/lecture_notes.pdf",
      classId: classObj._id,
      userId: userObj._id,
      type: "resource",
      deadline: null,
    };

    const file = await File.create(fileData);

    // Check if the file was created successfully
    expect(file).toBeDefined();
    expect(file.name).toBe(fileData.name);
    expect(file.path).toBe(fileData.path);
    expect(file.type).toBe(fileData.type);
    expect(file.classId.toString()).toBe(classObj._id.toString());
    expect(file.userId.toString()).toBe(userObj._id.toString());
  });

  test("should throw an error if required fields are missing", async () => {
    const fileData = {
      name: "missing_path.pdf", // Missing path field
      classId: classObj._id,
      userId: userObj._id,
      type: "assignment",
    };

    try {
      await File.create(fileData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.path).toBeDefined();
    }
  });

  test("should return a list of files with the correct classId", async () => {
    // Create files
    await File.create({
      name: "file1.pdf",
      path: "/files/file1.pdf",
      classId: classObj._id,
      userId: userObj._id,
      type: "resource",
    });
    await File.create({
      name: "file2.pdf",
      path: "/files/file2.pdf",
      classId: classObj._id,
      userId: userObj._id,
      type: "assignment",
    });

    const files = await File.find({ classId: classObj._id });

    // Check if the files are returned correctly
    expect(files.length).toBe(2);
    expect(files[0].classId.toString()).toBe(classObj._id.toString());
    expect(files[1].classId.toString()).toBe(classObj._id.toString());
  });

  test("should return an error when an invalid ObjectId is used for classId", async () => {
    const invalidClassId = "12345"; // Invalid ObjectId format

    const fileData = {
      name: "invalid_file.pdf",
      path: "/files/invalid_file.pdf",
      classId: invalidClassId,
      userId: userObj._id,
      type: "resource",
    };

    try {
      await File.create(fileData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("CastError");
    }
  });
});
