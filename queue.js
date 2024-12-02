const Bull = require('bull');
const redis = require('redis');

// Creating a queue for file uploads
const uploadQueue = new Bull('file-upload', {
  redis: {
    host: 'localhost',  // Redis host
    port: 6379,         // Redis port
  },
});

// Creating a job for file uploads
uploadQueue.process(async (job, done) => {
  const { fileId, filePath } = job.data;

  console.log('Processing file upload job:', job.id);

  try {
    // Here you can add file processing logic, like validating file format, moving it, etc.
    console.log(`Processing file: ${fileId}, located at: ${filePath}`);
    
    // Mark job as done
    done();
  } catch (error) {
    console.error("Error processing file upload job:", error);
    done(error); // If error, the job will fail
  }
});

module.exports = uploadQueue;
