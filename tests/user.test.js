// user.test.js
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User"); // adjust the path if needed

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

describe("User Model Tests", () => {

  afterEach(async () => {
    // Clean up after each test
    await User.deleteMany({});
  });

  test("should create a new user with valid fields", async () => {
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securepassword123",
      role: "teacher",
    };

    const user = await User.create(userData);

    // Check if the user was created successfully
    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.role).toBe(userData.role);
    expect(user.preferredLanguage).toBe("en"); // Default language
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
  });

  test("should throw an error if required fields are missing", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "securepassword123",
      // Missing role field
    };

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    }
  });

  test("should throw an error if email is not unique", async () => {
    const userData1 = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securepassword123",
      role: "teacher",
    };

    const userData2 = {
      name: "Jane Doe",
      email: "john.doe@example.com", // Same email as above
      password: "anotherpassword123",
      role: "student",
    };

    await User.create(userData1); // Create the first user

    try {
      // Attempt to create the second user with the same email
      await User.create(userData2);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.code).toBe(11000); // MongoDB error code for unique constraint violation
    }
  });

  test("should throw an error if role is invalid", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      password: "securepassword123",
      role: "admin", // Invalid role
    };

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.errors.role).toBeDefined();
    }
  });

  test("should default preferredLanguage to 'en' if not provided", async () => {
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securepassword123",
      role: "student",
    };

    const user = await User.create(userData);

    // Check that the preferredLanguage is set to 'en' by default
    expect(user.preferredLanguage).toBe("en");
  });

  test("should have timestamps for createdAt and updatedAt", async () => {
    const userData = {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "securepassword123",
      role: "teacher",
    };

    const user = await User.create(userData);

    // Check if timestamps are set correctly
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    expect(user.createdAt).toBe(user.updatedAt); // Initially, createdAt and updatedAt should be the same
  });
});
