const mongoose = require("mongoose");
const Class = require("../models/Class"); 
const User = require("../models/User"); 

describe("Class Model Unit Tests", () => {
  let teacher, student;

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

  beforeEach(async () => {
    // Creating a teacher and a student with required fields
    teacher = await User.create({
      name: "Teacher Name",
      email: "teacher@example.com",
      password: "securepassword",
      role: "teacher",
    });

    student = await User.create({
      name: "Student Name",
      email: "student@example.com",
      password: "securepassword",
      role: "student",
    });
  });

  afterEach(async () => {
    await Class.deleteMany({});
    await User.deleteMany({});
  });

  it("should create a class with valid data", async () => {
    const newClass = await Class.create({
      name: "Math 101",
      teacher: teacher._id,
      students: [student._id],
    });

    expect(newClass).toBeDefined();
    expect(newClass.name).toBe("Math 101");
    expect(newClass.teacher.toString()).toBe(teacher._id.toString());
    expect(newClass.students).toHaveLength(1);
    expect(newClass.students[0].toString()).toBe(student._id.toString());
  });

  it("should throw an error if `name` is missing", async () => {
    try {
      await Class.create({
        teacher: teacher._id,
        students: [student._id],
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("ValidationError");
    }
  });

  it("should throw an error if `teacher` is missing", async () => {
    try {
      await Class.create({
        name: "Math 101",
        students: [student._id],
      });
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.name).toBe("ValidationError");
    }
  });

  it("should create a class without students", async () => {
    const newClass = await Class.create({
      name: "Math 101",
      teacher: teacher._id,
    });

    expect(newClass).toBeDefined();
    expect(newClass.name).toBe("Math 101");
    expect(newClass.teacher.toString()).toBe(teacher._id.toString());
    expect(newClass.students).toHaveLength(0);
  });

  it("should populate teacher and students references", async () => {
    const newClass = await Class.create({
      name: "Math 101",
      teacher: teacher._id,
      students: [student._id],
    });

    const populatedClass = await Class.findById(newClass._id)
      .populate("teacher")
      .populate("students");

    expect(populatedClass.teacher.name).toBe("Teacher Name");
    expect(populatedClass.students[0].name).toBe("Student Name");
  });
});
