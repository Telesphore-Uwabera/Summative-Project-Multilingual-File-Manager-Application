# Summative Project: Multilingual File Manager Application

---

### **Scenario Overview: Educational File Manager**
A platform enabling teachers to manage class materials and assignments while allowing students to access resources and submit work in an organized and secure environment.

---

### **Core Features**
#### 1. **User Management**
   - **User Roles**:
     - **Teachers**:
       - Upload lecture notes, multimedia files, and assignments.
       - Create class directories and manage student submissions.
     - **Students**:
       - Access class materials uploaded by teachers.
       - Submit assignments within designated directories.
   - **Authentication**:
     - Secure login and registration with JWT for session management.
     - Use `bcrypt` to hash passwords.
   - **Profile Management**:
     - Allow users to update profiles (e.g., name, email, preferred language).

#### 2. **File Management**
   - **Teacher Features**:
     - Create directories for different classes or subjects.
     - Upload, update, and delete lecture notes or assignments.
     - Set deadlines for assignment submissions.
   - **Student Features**:
     - Upload assignments to designated directories.
     - View only materials for their enrolled classes.
   - **Storage**:
     - Use MongoDB to store metadata (e.g., filenames, upload timestamps).

#### 3. **Multilingual Support**
   - **Language Options**:
     - Provide at least 3 supported languages (e.g., English, Kinyarwanda, French).
     - Use `i18next` for dynamic language switching.
   - **Localized Interface**:
     - Ensure all text strings (e.g., labels, error messages) are localized.

#### 4. **Queuing System with Redis**
   - Handle large file uploads for:
     - Teacher materials (e.g., video lectures, presentations).
     - Student assignments (e.g., large projects or zip files).
   - Background tasks:
     - File validation (e.g., ensuring correct formats).
     - Notifications (e.g., alerting teachers of new submissions).
   - Real-time progress tracking using WebSockets (optional).

---

### **Optional Enhancements**
1. **Assignment Grading System**:
   - Allow teachers to grade student submissions and upload feedback.
2. **Analytics Dashboard**:
   - Track file usage (e.g., downloads per class, submission counts).
3. **Search Functionality**:
   - Enable users to search for files by name or tags.

---

### **Technical Implementation**
#### **Database Design (MongoDB)**
- **Collections**:
  - `users`: Store user information (name, role, email, password hash, preferred language).
  - `classes`: Metadata for each class (class name, teacher ID, student list).
  - `files`: Metadata for uploaded files (file name, path, class ID, uploader ID, type [resource/assignment]).
  - `submissions`: Metadata for student submissions (student ID, file reference, assignment reference).

#### **Endpoints**
- **User Management**:
  - `POST /register`: Register new users.
  - `POST /login`: Authenticate users and return JWT.
  - `GET /profile`: Get user profile.
  - `PUT /profile`: Update profile.
- **File Management**:
  - `POST /files`: Upload a file.
  - `GET /files/:classId`: Fetch files for a specific class.
  - `DELETE /files/:fileId`: Delete a file.
- **Assignment Submissions**:
  - `POST /submissions`: Submit an assignment.
  - `GET /submissions/:classId`: Get all submissions for a class (teacher only).

---

### **Project Workflow**
#### **1. Teacher Workflow**
1. Log in and create a class directory.
2. Upload lecture materials and assignments to the class directory.
3. View and grade student submissions.

#### **2. Student Workflow**
1. Log in and navigate to the relevant class.
2. View uploaded materials.
3. Submit assignments before the deadline.

---

## **Postman API Requests**

Below is a complete list of *Postman requests* you can use to test the application functionality step by step:

---

## *User Management*
### 1. *Register a New User*
- *Method*: POST
- *URL*: http://localhost:5000/api/auth/register
- *Body (JSON)*:
  ```json
  {
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123",
    "role": "teacher"
  }
  ```
- *Response*: User registration confirmation or error.

---

### 2. *Login*
- *Method*: POST
- *URL*: http://localhost:5000/api/auth/login
- *Body (JSON)*:
  ```json
  {
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- *Response*: Returns JWT token for authentication.

---

### 3. *Get Profile*
- *Method*: GET
- *URL*: http://localhost:5000/api/auth/profile
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Response*: User profile data.

---

### 4. *Update Profile*
- *Method*: PUT
- *URL*: http://localhost:5000/api/auth/profile
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Body (JSON)*:
  ```json
  {
    "name": "John Updated",
    "preferredLanguage": "fr"
  }
  ```
- *Response*: Updated user profile confirmation.

---

## *Class Management*
### 5. *Create a Class (Teacher Only)*
- *Method*: POST
- *URL*: http://localhost:5000/api/files/class
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Body (JSON)*:
  ```json
  {
    "name": "Math Class"
  }
  ```
- *Response*: Confirmation of class creation.

---

## *File Management*
### 6. *Upload a File (Teacher Only)*
- *Method*: POST
- *URL*: http://localhost:5000/api/files/upload
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Body* (Form-Data):
  - file: Upload a file.
  - name: Lecture Notes
  - classId: Math_Class_Id
  - type: material
  - deadline: 2024-12-31
- *Response*: File uploaded confirmation.

---

### 7. *Get Files for a Class*
- *Method*: GET
- *URL*: http://localhost:5000/api/files/materials/<ClassId>
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Response*: List of files for the specified class.

---

### 8. *Update File Metadata (Teacher Only)*
- *Method*: PUT
- *URL*: http://localhost:5000/api/files/<fileId>
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Body (JSON)*:
  ```json
  {
    "name": "Updated Lecture Notes",
    "deadline": "2024-12-30"
  }
  ```
- *Response*: File metadata updated confirmation.

---

### 9. *Delete a File (Teacher Only)*
- *Method*: DELETE
- *URL*: http://localhost:5000/api/files/<fileId>
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Response*: Confirmation of file deletion.

---

## *Assignment Submissions*
### 10. *Submit an Assignment (Student Only)*
- *Method*: POST
- *URL*: http://localhost:5000/api/files/submit/<ClassId>
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Body* (Form-Data):
  - file: Upload the assignment file.
- *Response*: Assignment submission confirmation.

---

### 11. *Get Submissions for a Class (Teacher Only)*
- *Method*: GET
- *URL*: http://localhost:5000/api/files/submissions/student/<ClassId>
- *Headers*:
  - Authorization: Bearer <JWT_TOKEN>
- *Response*: List of student submissions for the class.

---

## *Additional Tests*
### 12. *Test Multilingual Support*
Switch language by updating preferredLanguage in profile and ensure all responses/messages return in the selected language.

---

### 13. *Queue System Test*
- Check logs to verify that the Redis queue is processing file upload jobs.
- Ensure WebSocket real-time updates (if implemented).

---

*MongoDB*: We used MongoDB to manage the database.

---

## **Testing Framework**
We use **Jest** for unit testing to ensure the application’s functionality is properly validated. Tests cover areas such as user authentication, file uploads, submission creation, and class management.

---
