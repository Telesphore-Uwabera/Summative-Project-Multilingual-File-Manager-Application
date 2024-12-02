const mongoose = require('mongoose');
const File = require('../models/File'); // Adjust path as needed

describe("File Model Unit Tests", () => {
  // Set an increased timeout for the test suite
  jest.setTimeout(15000);

  beforeAll(async () => {
    try {
      // Connect to the test database
      await mongoose.connect('mongodb://localhost:27017/testDB', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    } catch (error) {
      console.error('Error connecting to test database:', error);
    }
  });

  afterEach(async () => {
    // Clear database after each test
    await mongoose.connection.dropDatabase();
  });

  afterAll(async () => {
    // Drop the database and close the connection after all tests
    await mongoose.connection.close();
  });

  it("should create a new file with valid data", async () => {
    const fileData = {
      name: "Assignment 1",
      path: "/files/assignment1.pdf",
      classId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      type: "assignment",
      deadline: new Date("2024-12-31"),
      fileBits: Buffer.from('file contents'), // Mock the file content
      fileName: "assignment1.pdf",
    };

    const file = new File(fileData);
    const savedFile = await file.save();

    expect(savedFile.name).toBe(fileData.name);
    expect(savedFile.path).toBe(fileData.path);
    expect(savedFile.type).toBe(fileData.type);
    expect(savedFile.deadline).toEqual(fileData.deadline);
  });

  it("should fail if 'name' is missing", async () => {
    const fileData = {
      path: "/files/assignment2.pdf",
      classId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      type: "resource",
    };

    const file = new File(fileData);

    await expect(file.save()).rejects.toThrowError(/validation failed/i);
  });

  it("should fail if 'type' is invalid", async () => {
    const fileData = {
      name: "Assignment 2",
      path: "/files/assignment2.pdf",
      classId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      type: "invalidType", // Invalid type
    };

    const file = new File(fileData);

    await expect(file.save()).rejects.toThrowError(/validation failed/i);
  });

  it("should fail if 'classId' is missing", async () => {
    const fileData = {
      name: "Assignment 3",
      path: "/files/assignment3.pdf",
      userId: new mongoose.Types.ObjectId(),
      type: "assignment",
    };

    const file = new File(fileData);

    await expect(file.save()).rejects.toThrowError(/validation failed/i);
  });

  it("should successfully create a file without a deadline", async () => {
    const fileData = {
      name: "Assignment 4",
      path: "/files/assignment4.pdf",
      classId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      type: "assignment",
    };

    const file = new File(fileData);
    const savedFile = await file.save();

    expect(savedFile.name).toBe(fileData.name);
    expect(savedFile.path).toBe(fileData.path);
    expect(savedFile.type).toBe(fileData.type);
    expect(savedFile.deadline).toBeNull();
  });
});
