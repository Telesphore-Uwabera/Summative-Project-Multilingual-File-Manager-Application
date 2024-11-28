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
     - Save files locally or on a cloud service like AWS S3.

#### 3. **Multilingual Support**
   - **Language Options**:
     - Provide at least 3 supported languages (e.g., English, Spanish, French).
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

### **Next Steps**
1. **Finalize the Tech Stack**:
   - Use `Express.js` for backend.
   - MongoDB for database.
   - Redis and Bull for queuing.
   - `i18next` for internationalization.

2. **Set Up Development Milestones**:
   - Week 1: Build user authentication and basic file upload.
   - Week 2: Implement directory and class management.
   - Week 3: Add Redis queuing and i18n support.
   - Week 4: Testing, documentation, and final touches.

3. **Documentation and Presentation**:
   - Write clear documentation for setting up and using the application.
   - Create a polished demo video showcasing workflows for teachers and students.

---
