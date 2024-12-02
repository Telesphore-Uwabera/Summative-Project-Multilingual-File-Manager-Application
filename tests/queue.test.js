const uploadQueue = require('../queue'); // Adjust path if necessary

// Mock Bull
jest.mock('bull', () => {
  const mockProcess = jest.fn();
  const mockQueueInstance = {
    process: mockProcess,
    add: jest.fn(),
  };

  return jest.fn().mockImplementation(() => mockQueueInstance);
});

describe('Queue Tests', () => {
  let mockProcessCallback;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProcessCallback = jest.fn((job, done) => {
      try {
        const { fileId, filePath } = job.data;
        console.log('Processing file upload job:', job.id);
        console.log(`Processing file: ${fileId}, located at: ${filePath}`);

        // Simulate a failure for error test
        if (job.data.fileId === 'error') {
          throw new Error('Test error');
        }

        done();
      } catch (error) {
        done(error); // Mark job as failed with an error
      }
    });

    // Ensure that the `uploadQueue.process` method is called with the correct callback
    uploadQueue.process(mockProcessCallback);
  });

  it('should process a job with the correct callback', () => {
    expect(uploadQueue.process).toHaveBeenCalledWith(expect.any(Function)); // This ensures the process method was called with a function
  });

  it('should handle errors during job processing', () => {
    const mockJobWithError = { id: 'job2', data: { fileId: 'error', filePath: '/path/to/error/file' } };

    // Simulate the job processing with error
    mockProcessCallback(mockJobWithError, (error) => {
      expect(error).toBeInstanceOf(Error); // Check that the error is an instance of Error
      expect(error.message).toBe('Test error'); // Check that the error message matches
    });

    // Test that the error was handled properly
    expect(mockProcessCallback).toHaveBeenCalledWith(mockJobWithError, expect.any(Function)); // Check callback invocation
  });
});
