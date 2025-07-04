# RISA Management System - API Documentation

## Base URL
```
http://localhost/RISA%20management%20system/backend/public/
```

## Authentication
Most endpoints require authentication. Include user session or use the login endpoint to get authenticated.

## Response Format
All responses are in JSON format:
```json
{
  "success": true/false,
  "data": {...},
  "message": "Description"
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Registration successful"
}
```

### Login
**POST** `/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "session_token_here"
}
```

### Request Password Reset
**POST** `/password-reset/request`
```json
{
  "email": "john@example.com"
}
```

### Reset Password
**POST** `/password-reset/reset`
```json
{
  "token": "reset_token_here",
  "new_password": "newpassword123"
}
```

---

## 👤 User Management

### Get Profile
**GET** `/profile?user_id=1`
**Response:**
```json
{
  "success": true,
  "profile": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "profile_picture": "uploads/profile_pictures/abc123.jpg",
    "created_at": "2024-01-01 10:00:00"
  }
}
```

### Update Profile
**PUT** `/profile?user_id=1`
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "password": "newpassword123"
}
```

### Upload Profile Picture
**POST** `/profile/picture?user_id=1`
**Form Data:**
- `profile_picture`: File upload

---

## 🏫 Academic Management

### Classes

#### List All Classes
**GET** `/classes`
**Response:**
```json
{
  "success": true,
  "classes": [
    {
      "id": 1,
      "name": "Class 10A"
    }
  ]
}
```

#### Create Class (Admin Only)
**POST** `/classes`
```json
{
  "name": "Class 11B"
}
```

#### Update Class (Admin Only)
**PUT** `/classes`
```json
{
  "id": 1,
  "name": "Class 10A Updated"
}
```

#### Delete Class (Admin Only)
**DELETE** `/classes`
```json
{
  "id": 1
}
```

### Students

#### List All Students
**GET** `/students`
**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": 1,
      "user_id": 1,
      "class_id": 1,
      "section_id": 1,
      "roll_number": "ST001"
    }
  ]
}
```

#### Create Student (Admin Only)
**POST** `/students`
```json
{
  "user_id": 1,
  "class_id": 1,
  "section_id": 1,
  "roll_number": "ST002"
}
```

### Teachers

#### List All Teachers
**GET** `/teachers`
**Response:**
```json
{
  "success": true,
  "teachers": [
    {
      "id": 1,
      "user_id": 2,
      "subject_id": 1
    }
  ]
}
```

#### Create Teacher (Admin Only)
**POST** `/teachers`
```json
{
  "user_id": 2,
  "subject_id": 1
}
```

---

## 📚 Academic Operations

### Attendance

#### Mark Attendance (Teacher Only)
**POST** `/attendance`
```json
{
  "student_id": 1,
  "date": "2024-01-15",
  "status": "present"
}
```

#### Get Attendance Records
**GET** `/attendance?student_id=1`
**GET** `/attendance?date=2024-01-15`

### Exams

#### List All Exams
**GET** `/exams`
**Response:**
```json
{
  "success": true,
  "exams": [
    {
      "id": 1,
      "name": "Mid-Term Exam",
      "class_id": 1,
      "date": "2024-02-01"
    }
  ]
}
```

#### Create Exam (Teacher Only)
**POST** `/exams`
```json
{
  "name": "Final Exam",
  "class_id": 1,
  "date": "2024-03-15"
}
```

### Results

#### Get Results by Student
**GET** `/results?student_id=1`
**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": 1,
      "student_id": 1,
      "exam_id": 1,
      "subject_id": 1,
      "marks_obtained": 85,
      "total_marks": 100
    }
  ]
}
```

#### Create Result (Teacher Only)
**POST** `/results`
```json
{
  "student_id": 1,
  "exam_id": 1,
  "subject_id": 1,
  "marks_obtained": 85,
  "total_marks": 100
}
```

### Timetable

#### List Timetables
**GET** `/timetable`
**GET** `/timetable?class_id=1`

#### Create Timetable (Admin Only)
**POST** `/timetable`
```json
{
  "class_id": 1,
  "subject_id": 1,
  "teacher_id": 1,
  "day_of_week": "Monday",
  "start_time": "09:00:00",
  "end_time": "10:00:00"
}
```

---

## 💰 Administrative Operations

### Fees

#### Get Fees by Student
**GET** `/fees?student_id=1`
**Response:**
```json
{
  "success": true,
  "fees": [
    {
      "id": 1,
      "student_id": 1,
      "amount": 500.00,
      "due_date": "2024-02-01",
      "status": "unpaid"
    }
  ]
}
```

#### Create Fee (Admin Only)
**POST** `/fees`
```json
{
  "student_id": 1,
  "amount": 500.00,
  "due_date": "2024-02-01",
  "status": "unpaid"
}
```

### Notifications

#### Get Notifications by User
**GET** `/notifications?user_id=1`
**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "message": "New exam scheduled",
      "created_at": "2024-01-15 10:00:00"
    }
  ]
}
```

#### Create Notification (Admin Only)
**POST** `/notifications`
```json
{
  "user_id": 1,
  "message": "Important announcement"
}
```

#### Send Email (Admin Only)
**POST** `/notifications/email`
```json
{
  "user_id": 1,
  "subject": "Important Notice",
  "message": "Please check your results"
}
```

#### Send Bulk Email (Admin Only)
**POST** `/notifications/bulk-email`
```json
{
  "user_ids": [1, 2, 3],
  "subject": "General Announcement",
  "message": "School will be closed tomorrow"
}
```

---

## 📄 Document Management

### List Documents
**GET** `/documents`
**GET** `/documents?user_id=1`
**GET** `/documents?class_id=1`

### Upload Document
**POST** `/documents/upload`
**Form Data:**
- `document`: File upload
- `user_id`: 1 (optional)
- `class_id`: 1 (optional)
- `subject_id`: 1 (optional)
- `type`: "assignment" (optional)
- `description`: "Math homework" (optional)

### Download Document
**GET** `/documents/download?id=1`
*Returns file download*

### Delete Document
**DELETE** `/documents`
```json
{
  "id": 1
}
```

---

## 💬 Messaging

### Get Messages
**GET** `/messages`
**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "sender_id": 1,
      "receiver_id": 2,
      "message": "Hello!",
      "sent_at": "2024-01-15 10:00:00",
      "is_read": 0
    }
  ]
}
```

### Send Message
**POST** `/messages`
```json
{
  "receiver_id": 2,
  "message": "Hello, how are you?"
}
```

### Get Conversation
**GET** `/messages/conversation?user_id=2`

### Mark as Read
**PUT** `/messages/read`
```json
{
  "message_id": 1
}
```

---

## 📊 Reports & Analytics

### Attendance Report
**GET** `/reports/attendance?class_id=1&start_date=2024-01-01&end_date=2024-01-31`
**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "student_id": 1,
      "roll_number": "ST001",
      "name": "John Doe",
      "presents": 20,
      "absents": 2,
      "lates": 1,
      "total": 23
    }
  ]
}
```

### Exam Performance Report
**GET** `/reports/exam-performance?class_id=1&exam_id=1`
**Response:**
```json
{
  "success": true,
  "performance": [
    {
      "subject": "Mathematics",
      "average_marks": 75.5,
      "highest_marks": 95,
      "lowest_marks": 45
    }
  ]
}
```

---

## 📈 Dashboards

### Admin Dashboard
**GET** `/dashboard/admin`
**Response:**
```json
{
  "success": true,
  "stats": {
    "total_students": 150,
    "total_teachers": 25,
    "total_classes": 12
  },
  "recent_notifications": [...]
}
```

### Teacher Dashboard
**GET** `/dashboard/teacher?teacher_id=1`
**Response:**
```json
{
  "success": true,
  "subjects": ["Mathematics", "Physics"],
  "stats": {
    "total_students": 45
  },
  "recent_attendance": [...]
}
```

### Student Dashboard
**GET** `/dashboard/student?student_id=1`
**Response:**
```json
{
  "success": true,
  "student_info": {
    "id": 1,
    "name": "John Doe",
    "class_name": "Class 10A"
  },
  "recent_attendance": [...],
  "recent_results": [...]
}
```

### Parent Dashboard
**GET** `/dashboard/parent?parent_id=1`
**Response:**
```json
{
  "success": true,
  "students": [
    {
      "id": 1,
      "student_name": "John Doe"
    }
  ],
  "recent_notifications": [...]
}
```

---

## 📥 Import/Export

### Import CSV (Admin Only)
**POST** `/import/students`
**Form Data:**
- `csv`: CSV file upload

### Export CSV (Admin Only)
**GET** `/export/students`
*Returns CSV file download*

Available entities: `students`, `teachers`, `classes`, `subjects`, `parents`

---

## ⚙️ User Settings

### Get Settings
**GET** `/settings?user_id=1`
**Response:**
```json
{
  "success": true,
  "settings": {
    "theme": "dark",
    "language": "en",
    "notifications": "enabled"
  }
}
```

### Update Setting
**PUT** `/settings`
```json
{
  "user_id": 1,
  "key": "theme",
  "value": "light"
}
```

### Delete Setting
**DELETE** `/settings`
```json
{
  "user_id": 1,
  "key": "theme"
}
```

---

## 🔐 Role-Based Access Control

### Admin Permissions
- Full access to all endpoints
- Can manage users, classes, subjects
- Can send notifications and emails
- Can view all reports and analytics

### Teacher Permissions
- Can mark attendance
- Can create and manage exams/results
- Can view class-specific data
- Can send messages

### Student Permissions
- Can view own data
- Can send/receive messages
- Can update profile settings

### Parent Permissions
- Can view linked student data
- Can receive notifications
- Can send/receive messages

---

## 🚨 Error Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Testing Examples

### Using Postman

1. **Login First:**
   ```
   POST /login
   Body: {"email": "admin@school.com", "password": "admin123"}
   ```

2. **Create a Class:**
   ```
   POST /classes
   Body: {"name": "Class 11A"}
   ```

3. **Upload Document:**
   ```
   POST /documents/upload
   Form Data: document file + other fields
   ```

4. **Get Dashboard:**
   ```
   GET /dashboard/admin
   ```

---

## 🔧 Configuration

### Database Configuration
Update `backend/config/db.php`:
```php
$host = 'localhost';
$dbname = 'risa_management';
$username = 'your_username';
$password = 'your_password';
```

### File Upload Limits
Ensure your PHP configuration allows file uploads:
```ini
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

---

This API documentation covers all endpoints and features of the RISA Management System backend. 