# RISA Management System - Backend API

A comprehensive school management system backend built with PHP, providing RESTful APIs for managing students, teachers, classes, attendance, exams, fees, and more.

## 🚀 Features

### Core Features
- **User Authentication & Authorization**
  - Register, login, logout
  - Role-based access control (Admin, Teacher, Student, Parent)
  - Password reset with email tokens
  - Profile management with picture upload

- **Student Management**
  - CRUD operations for students
  - Link students to classes and sections
  - Roll number management

- **Teacher Management**
  - CRUD operations for teachers
  - Subject assignment
  - Teacher-student relationships

- **Class & Section Management**
  - Create and manage classes
  - Section management within classes
  - Class-teacher assignments

- **Subject Management**
  - CRUD operations for subjects
  - Subject-teacher assignments

- **Parent/Guardian Management**
  - CRUD operations for parents
  - Link parents to students

### Academic Features
- **Attendance Management**
  - Mark daily attendance (present, absent, late)
  - View attendance by student or date
  - Attendance reports

- **Exam Management**
  - Create and manage exams
  - Link exams to classes
  - Exam scheduling

- **Result Management**
  - Record and manage exam results
  - Performance analytics
  - Result reports by student

- **Timetable/Schedule Management**
  - Create class schedules
  - Assign subjects and teachers to time slots
  - View timetables by class

### Administrative Features
- **Fee Management**
  - Create and manage fee records
  - Track payment status (paid, unpaid, partial)
  - Fee reports by student

- **Notification System**
  - Send notifications to users
  - Email notifications
  - Bulk email functionality

- **Document Management**
  - Upload and manage documents
  - Link documents to users, classes, or subjects
  - Download functionality

### Advanced Features
- **Bulk Import/Export**
  - CSV import/export for students, teachers, classes, subjects, parents
  - Batch processing capabilities

- **Reports & Analytics**
  - Attendance reports with date ranges
  - Exam performance analytics
  - Statistical dashboards

- **Messaging System**
  - Direct user-to-user messaging
  - Conversation management
  - Message read status

- **User Settings & Preferences**
  - Customizable user settings
  - Key-value preference storage

- **Custom Dashboards**
  - Role-specific dashboards
  - Real-time statistics
  - Recent activity feeds

- **Audit Logs**
  - Track user actions
  - Security monitoring
  - Compliance logging

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and authentication
- `classes` - School classes
- `sections` - Class sections
- `subjects` - Academic subjects
- `students` - Student records
- `teachers` - Teacher records
- `parents` - Parent/guardian records

### Academic Tables
- `attendance` - Daily attendance records
- `exams` - Exam information
- `results` - Exam results
- `timetable` - Class schedules

### Administrative Tables
- `fees` - Fee records
- `notifications` - System notifications
- `documents` - File uploads
- `messages` - User messages

### System Tables
- `password_resets` - Password reset tokens
- `user_settings` - User preferences
- `audit_logs` - Action tracking

## 🔌 API Endpoints

### Authentication
```
POST /register          - User registration
POST /login             - User login
POST /password-reset/request  - Request password reset
POST /password-reset/reset    - Reset password with token
```

### User Management
```
GET    /profile         - Get user profile
PUT    /profile         - Update profile
POST   /profile/picture - Upload profile picture
GET    /settings        - Get user settings
PUT    /settings        - Update user setting
DELETE /settings        - Delete user setting
```

### Academic Management
```
# Classes
GET    /classes         - List all classes
POST   /classes         - Create class (Admin)
PUT    /classes         - Update class (Admin)
DELETE /classes         - Delete class (Admin)

# Sections
GET    /sections        - List sections by class
POST   /sections        - Create section (Admin)
PUT    /sections        - Update section (Admin)
DELETE /sections        - Delete section (Admin)

# Students
GET    /students        - List all students
POST   /students        - Create student (Admin)
PUT    /students        - Update student (Admin)
DELETE /students        - Delete student (Admin)

# Teachers
GET    /teachers        - List all teachers
POST   /teachers        - Create teacher (Admin)
PUT    /teachers        - Update teacher (Admin)
DELETE /teachers        - Delete teacher (Admin)

# Subjects
GET    /subjects        - List all subjects
POST   /subjects        - Create subject (Admin)
PUT    /subjects        - Update subject (Admin)
DELETE /subjects        - Delete subject (Admin)

# Parents
GET    /parents         - List all parents (Admin)
POST   /parents         - Create parent (Admin)
PUT    /parents         - Update parent (Admin)
DELETE /parents         - Delete parent (Admin)
```

### Academic Operations
```
# Attendance
POST   /attendance      - Mark attendance (Teacher)
GET    /attendance      - Get attendance records

# Exams
GET    /exams           - List all exams
POST   /exams           - Create exam (Teacher)
PUT    /exams           - Update exam (Teacher)
DELETE /exams           - Delete exam (Teacher)

# Results
GET    /results         - Get results by student
POST   /results         - Create result (Teacher)
PUT    /results         - Update result (Teacher)
DELETE /results         - Delete result (Teacher)

# Timetable
GET    /timetable       - List timetables
POST   /timetable       - Create timetable (Admin)
PUT    /timetable       - Update timetable (Admin)
DELETE /timetable       - Delete timetable (Admin)
```

### Administrative Operations
```
# Fees
GET    /fees            - Get fees by student
POST   /fees            - Create fee (Admin)
PUT    /fees            - Update fee (Admin)
DELETE /fees            - Delete fee (Admin)

# Notifications
GET    /notifications   - Get notifications by user
POST   /notifications   - Create notification (Admin)
DELETE /notifications   - Delete notification (Admin)
POST   /notifications/email      - Send email (Admin)
POST   /notifications/bulk-email - Send bulk email (Admin)

# Documents
GET    /documents       - List documents
POST   /documents/upload - Upload document
GET    /documents/download - Download document
DELETE /documents       - Delete document
```

### Advanced Features
```
# Messaging
GET    /messages        - Get user messages
POST   /messages        - Send message
GET    /messages/conversation - Get conversation
PUT    /messages/read   - Mark as read

# Import/Export
POST   /import/{entity} - Import CSV (Admin)
GET    /export/{entity} - Export CSV (Admin)

# Reports
GET    /reports/attendance      - Attendance report
GET    /reports/exam-performance - Exam performance report

# Dashboards
GET    /dashboard/admin  - Admin dashboard
GET    /dashboard/teacher - Teacher dashboard
GET    /dashboard/student - Student dashboard
GET    /dashboard/parent  - Parent dashboard
```

## 🛠️ Setup Instructions

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server
- XAMPP (recommended for development)

### Installation
1. Clone the repository to your web server directory
2. Import the database schema from `backend/database/schema.sql`
3. Configure database connection in `backend/config/db.php`
4. Ensure proper file permissions for uploads directory
5. Start your web server

### Configuration
Update `backend/config/db.php` with your database credentials:
```php
$host = 'localhost';
$dbname = 'risa_management';
$username = 'your_username';
$password = 'your_password';
```

### File Structure
```
backend/
├── config/
│   └── db.php
├── database/
│   └── schema.sql
├── public/
│   ├── index.php
│   └── uploads/
│       ├── profile_pictures/
│       └── documents/
├── src/
│   ├── controllers/
│   ├── routes/
│   └── utils/
└── README.md
```

## 🔐 Security Features

- **Password Hashing**: All passwords are hashed using PHP's `password_hash()`
- **SQL Injection Prevention**: Prepared statements used throughout
- **Role-Based Access Control**: Endpoint protection based on user roles
- **Session Management**: Secure session handling
- **Audit Logging**: All critical actions are logged
- **Input Validation**: Comprehensive input validation and sanitization

## 📊 Role Permissions

### Admin
- Full access to all features
- Can manage users, classes, subjects
- Can send notifications and emails
- Can view all reports and analytics

### Teacher
- Can mark attendance
- Can create and manage exams/results
- Can view class-specific data
- Can send messages to students/parents

### Student
- Can view own attendance and results
- Can send/receive messages
- Can access personal dashboard
- Can update profile settings

### Parent
- Can view linked student data
- Can receive notifications
- Can send/receive messages
- Can access parent dashboard

## 🚀 API Response Format

All API responses follow a consistent JSON format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## 📝 Testing

Use Postman or any API testing tool to test endpoints:

1. Start with authentication endpoints
2. Test role-based access control
3. Verify CRUD operations
4. Test file uploads and downloads
5. Validate report generation

## 🔄 Future Enhancements

- Mobile app API support
- Real-time notifications (WebSocket)
- Advanced reporting and analytics
- Multi-language support
- Advanced file management
- Integration with external services

## 📞 Support

For technical support or questions, please refer to the project documentation or contact the development team.

---

**RISA Management System** - Empowering educational institutions with comprehensive digital management solutions. 