const request = require('supertest');
const app = require('../app');  // Ensure you're importing the Express app

describe('Route Tests', () => {
  
  describe('File Upload Routes', () => {
    it('should upload a file successfully (Teacher only)', async () => {
      const response = await request(app)
        .post('/api/files/upload')  // Adjust the route as needed
        .set('Authorization', 'Bearer valid_token')  // Add a valid token
        .attach('file', 'path/to/file.jpg');  // Attach a file for upload

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'File uploaded successfully');
    });

    it('should return an error if file is not provided', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', 'Bearer valid_token');  // No file attached

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'File is required');
    });
  });

});
