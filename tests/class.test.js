const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Class = require("../models/Class"); // Assuming Class is in models/Class.js
const User = require("../models/User"); // Assuming User is in models/User.js

let mongoServer;
let user1, user2;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });

  // Create test users (assuming the User model has a basic name field)
  user1 = await User.create({ name: "Teacher Name" });
  user2 = await User.create({ name: "Student Name" });
});

afterAll(async () => {
  // Clean up after tests and close the connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Class Model", () => {
  it("should create a class with a teacher and students", async () => {
    const newClass = await Class.create({
      name: "Math 101",
      teacher: user1._id,  // Assign the teacher from the created user
      students: [user2._id],  // Assign the student from the created user
    });

    // Check if the class is created correctly
    expect(newClass).toHaveProperty("name", "Math 101");
    expect(newClass).toHaveProperty("teacher", user1._id);
    expect(newClass).toHaveProperty("students");
    expect(newClass.students).toHaveLength(1);
    expect(newClass.students[0].toString()).toBe(user2._id.toString());
  });

  it("should fail to create a class without a teacher", async () => {
    try {
      await Class.create({
        name: "History 101",
        // Missing teacher reference
        students: [user2._id],
      });
    } catch (error) {
      expect(error).toHaveProperty("name", "ValidationError");
    }
  });

  it("should fail to create a class with an invalid student reference", async () => {
    try {
      await Class.create({
        name: "English 101",
        teacher: user1._id,
        students: ["invalidstudentid"], // Invalid ObjectId
      });
    } catch (error) {
      expect(error).toHaveProperty("name", "ValidationError");
    }
  });
});
