# Multilingual File Manager Application

## Overview

The **Educational File Manager** platform enables teachers to manage class materials and assignments while allowing students to access resources and submit work in an organized and secure environment. This application supports multiple languages and allows seamless interactions through APIs with Postman.

## Core Features

1. **User Management**: Teachers and students can register, login, and manage their profiles.
2. **File Management**: Teachers can upload, update, and delete class materials. Students can view materials and submit assignments.
3. **Multilingual Support**: English, Kinyarwanda, and French are supported.
4. **Queuing System with Redis**: Handle large file uploads and background tasks.
5. **Assignment Grading System**: Teachers can grade assignments and provide feedback.
6. **Analytics Dashboard**: Track file usage and submission counts.
7. **Search Functionality**: Search files by name or tags.

## Setup Instructions

### Prerequisites

- Node.js installed
- MongoDB installed or access to a MongoDB database
- Redis installed for queuing system (optional for production)

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-username/Summative-Project-Multilingual-File-Manager-Application.git
   cd Summative-Project-Multilingual-File-Manager-Application
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root of the project and set the following environment variables:
   ```bash
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

4. **Run the application**:
   ```bash
   npm start
   ```

---

## API Endpoints

### User Management

#### 1. Register User

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "teacher",  // or "student"
    "preferredLanguage": "en"  // "en", "fr", or "rw"
  }
  ```

- **Success Response**:
  ```json
  {
    "message": "User registered successfully"
  }
  ```

#### 2. Login User

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```

- **Success Response**:
  ```json
  {
    "token": "your_jwt_token_here"
  }
  ```

#### 3. Get Profile

- **URL**: `/api/auth/profile`
- **Method**: `GET`
- **Headers**: 
  ```bash
  Authorization: Bearer your_jwt_token_here
  ```

- **Success Response**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "role": "teacher",
    "preferredLanguage": "en"
  }
  ```

#### 4. Update Profile

- **URL**: `/api/auth/profile`
- **Method**: `PUT`
- **Headers**: 
  ```bash
  Authorization: Bearer your_jwt_token_here
  ```

- **Request Body**:
  ```json
  {
    "name": "John Updated",
    "email": "johnupdated@example.com"
  }
  ```

- **Success Response**:
  ```json
  {
    "message": "Profile updated successfully"
  }
  ```

---

### File Management

#### 1. Upload File (Teacher)

- **URL**: `/api/files/upload`
- **Method**: `POST`
- **Headers**:
  ```bash
  Authorization: Bearer your_jwt_token_here
  ```
- **Form Data** (for file upload):
  - `name`: "Lecture Notes"
  - `classId`: "class_id_here"
  - `type`: "resource"  // "resource" or "assignment"
  - `deadline`: "2024-12-31T23:59:59"  // optional, for assignments
  - `file`: [choose your file]
  
- **Success Response**:
  ```json
  {
    "msg": "File uploaded successfully",
    "file": {
      "name": "Lecture Notes",
      "path": "uploads/teacher1/class1/lecture_notes.pdf",
      "deadline": "2024-12-31T23:59:59"
    }
  }
  ```

#### 2. Delete File (Teacher)

- **URL**: `/api/files/:fileId`
- **Method**: `DELETE`
- **Headers**:
  ```bash
  Authorization: Bearer your_jwt_token_here
  ```

- **Success Response**:
  ```json
  {
    "msg": "File deleted successfully"
  }
  ```

---

### Assignment Submissions

#### 1. Submit Assignment (Student)

- **URL**: `/api/files/submit/:classId`
- **Method**: `POST`
- **Headers**:
  ```bash
  Authorization: Bearer your_jwt_token_here
  ```
- **Form Data** (for file upload):
  - `assignmentFile`: [choose assignment file]
  
- **Success Response**:
  ```json
  {
    "msg": "Assignment submitted successfully",
    "submission": {
      "assignment": "Assignment 1",
      "file": "uploads/student1/class1/assignment1.pdf"
    }
  }
  ```

---

## Using Postman to Test the API

### 1. Register a User

- Open **Postman** and select **POST** method.
- Enter the URL: `http://localhost:5000/api/auth/register`.
- In the **Body** section, select **raw** and choose **JSON** format. Add the request body:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123",
    "role": "teacher",
    "preferredLanguage": "en"
  }
  ```
- Click **Send** to register the user. You will receive a response with a success message.

### 2. Login the User

- Open **Postman** and select **POST** method.
- Enter the URL: `http://localhost:5000/api/auth/login`.
- In the **Body** section, select **raw** and choose **JSON** format. Add the request body:
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- Click **Send** to login. You will receive a **JWT token** in the response.

### 3. Upload File (Teacher)

- Open **Postman** and select **POST** method.
- Enter the URL: `http://localhost:5000/api/files/upload`.
- Under **Authorization**, choose **Bearer Token** and paste the **JWT token** from the login response.
- In the **Body** section, select **form-data** and add the following:
  - `name`: "Lecture Notes"
  - `classId`: "class_id_here"
  - `type`: "resource"
  - `file`: [choose file to upload]
- Click **Send** to upload the file. You will receive a success response with the file details.

### 4. Submit Assignment (Student)

- Open **Postman** and select **POST** method.
- Enter the URL: `http://localhost:5000/api/files/submit/class_id_here`.
- Under **Authorization**, choose **Bearer Token** and paste the **JWT token**.
- In the **Body** section, select **form-data** and add:
  - `assignmentFile`: [choose assignment file to submit]
- Click **Send** to submit the assignment. You will receive a success message with submission details.

---

## Connecting MongoDB with Postman

1. **MongoDB Connection**:
   - Ensure MongoDB is running and accessible from your application.
   - The connection string should be provided in the `.env` file as `MONGO_URI`.
   - This allows Postman requests to interact with the MongoDB database.

2. **Check Data**:
   - You can use MongoDB's shell or a GUI tool like **MongoDB Compass** to check if the data is correctly stored in your database after each API call.

---

## Conclusion

This guide covers how to interact with the API for user registration, login, file upload, and assignment submission. With Postman, you can easily test these endpoints and verify the functionality of your platform. The MongoDB integration ensures that all user data, files, and submissions are securely stored and managed.

Feel free to modify or extend the APIs based on your project’s needs! Let me know if you need any further clarification or modifications!
```

This **README.md** provides all the necessary details about the setup, API usage, and instructions to test the platform with Postman. Make sure to replace `your-username` with your actual GitHub username and adapt the MongoDB URI and JWT secret in your `.env` file.
