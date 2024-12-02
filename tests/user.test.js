const mongoose = require("mongoose");
const User = require("../models/User"); // Adjust the path to the User model

describe("User Model Unit Tests", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/test", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it("should create a user with valid data", async () => {
    const userData = {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "securepassword",
      role: "teacher",
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user.name).toBe("John Doe");
    expect(user.email).toBe("johndoe@example.com");
    expect(user.role).toBe("teacher");
    expect(user.preferredLanguage).toBe("en"); // Default value
  });

  it("should throw an error if `name` is missing", async () => {
    const userData = {
      email: "johndoe@example.com",
      password: "securepassword",
      role: "teacher",
    };

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("ValidationError");
      expect(error.errors.name).toBeDefined();
    }
  });

  it("should throw an error if `email` is missing", async () => {
    const userData = {
      name: "John Doe",
      password: "securepassword",
      role: "teacher",
    };

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("ValidationError");
      expect(error.errors.email).toBeDefined();
    }
  });

  it("should throw an error if `email` is not unique", async () => {
    const userData = {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "securepassword",
      role: "teacher",
    };

    await User.create(userData);

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("MongoServerError");
      expect(error.code).toBe(11000); // Duplicate key error code
    }
  });

  it("should throw an error if `role` is not valid", async () => {
    const userData = {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "securepassword",
      role: "invalidRole",
    };

    try {
      await User.create(userData);
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("ValidationError");
      expect(error.errors.role).toBeDefined();
    }
  });

  it("should use the default value for `preferredLanguage` if not provided", async () => {
    const userData = {
      name: "John Doe",
      email: "johndoe@example.com",
      password: "securepassword",
      role: "teacher",
    };

    const user = await User.create(userData);

    expect(user.preferredLanguage).toBe("en"); // Default value
  });
});
