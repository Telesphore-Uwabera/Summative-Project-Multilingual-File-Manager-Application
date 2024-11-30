const request = require('supertest');
const app = require('../app'); // Path to your app.js file (or server.js)

// Mock authentication middleware
const mockAuthMiddleware = (req, res, next) => {
  req.user = { _id: 'testUserId', role: 'teacher' };  // Simulating an authenticated teacher
  next();
};

// Apply the mock middleware for testing purposes
app.use('/api/files', mockAuthMiddleware);

describe('File Upload Routes', () => {
  it('should upload a file successfully (Teacher only)', async () => {
    const response = await request(app)
      .post('/api/files/upload')
      .field('name', 'Test File')
      .field('classId', 'testClassId')
      .field('type', 'document')
      .attach('file', './test/sample-file.txt');  // Ensure the test file exists in the specified path

    expect(response.status).toBe(201);
    expect(response.body.msg).toBe('File uploaded successfully');
    expect(response.body.file).toHaveProperty('name');
    expect(response.body.file).toHaveProperty('path');
  });

  it('should return an error if user is not authenticated as teacher', async () => {
    // Simulate non-teacher user
    const mockNonTeacherMiddleware = (req, res, next) => {
      req.user = { _id: 'testUserId', role: 'student' };  // Simulating a non-teacher user
      next();
    };
    
    app.use('/api/files', mockNonTeacherMiddleware);

    const response = await request(app)
      .post('/api/files/upload')
      .field('name', 'Test File')
      .field('classId', 'testClassId')
      .field('type', 'document')
      .attach('file', './test/sample-file.txt');

    expect(response.status).toBe(403);
    expect(response.body.msg).toBe('Access denied: Teacher only');
  });
});
