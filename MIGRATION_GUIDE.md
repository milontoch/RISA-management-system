# Migration Guide: PHP Backend to Laravel Backend

## Overview
The school management system has been migrated from a custom PHP backend to a modern Laravel backend with improved architecture, better security, and comprehensive API endpoints.

## Changes Made

### 1. Backend Migration
- **Old**: Custom PHP backend with basic CRUD operations
- **New**: Laravel 10 backend with:
  - Laravel Sanctum authentication
  - Eloquent ORM with proper relationships
  - Comprehensive validation and error handling
  - RESTful API design
  - Database migrations and seeders

### 2. Frontend Updates
- **API Service**: Centralized API service (`frontend/src/services/api.js`)
- **Configuration**: Environment-based config (`frontend/src/config.js`)
- **Authentication**: Updated to use Laravel Sanctum tokens
- **Error Handling**: Improved error handling and user feedback

## New API Structure

### Authentication Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile
- `GET /api/dashboard` - Get dashboard data

### Resource Endpoints
All endpoints follow RESTful conventions:

#### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/{id}` - Get user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

#### Students
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `GET /api/students/{id}` - Get student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `GET /api/students/{id}/attendance` - Get student attendance
- `GET /api/students/{id}/results` - Get student results

#### Classes
- `GET /api/classes` - List classes
- `POST /api/classes` - Create class
- `GET /api/classes/{id}` - Get class
- `PUT /api/classes/{id}` - Update class
- `DELETE /api/classes/{id}` - Delete class
- `GET /api/classes/{id}/students` - Get class students
- `GET /api/classes/{id}/subjects` - Get class subjects
- `POST /api/classes/{id}/subjects` - Add subject to class
- `DELETE /api/classes/{id}/subjects/{subjectId}` - Remove subject from class

#### Subjects
- `GET /api/subjects` - List subjects
- `POST /api/subjects` - Create subject
- `GET /api/subjects/{id}` - Get subject
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject
- `GET /api/subjects/class/{classId}` - Get subjects by class
- `GET /api/subjects/active` - Get active subjects

#### Teachers
- `GET /api/teachers` - List teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/{id}` - Get teacher
- `PUT /api/teachers/{id}` - Update teacher
- `DELETE /api/teachers/{id}` - Delete teacher
- `GET /api/teachers/{id}/classes` - Get teacher classes
- `GET /api/teachers/{id}/subjects` - Get teacher subjects
- `GET /api/teachers/{id}/dashboard` - Get teacher dashboard

#### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Create attendance record
- `PUT /api/attendance/{id}` - Update attendance record
- `DELETE /api/attendance/{id}` - Delete attendance record
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance/report` - Get attendance report
- `GET /api/attendance/class/{classId}` - Get attendance by class
- `GET /api/attendance/student/{studentId}` - Get attendance by student

#### Exams
- `GET /api/exams` - List exams
- `POST /api/exams` - Create exam
- `GET /api/exams/{id}` - Get exam
- `PUT /api/exams/{id}` - Update exam
- `DELETE /api/exams/{id}` - Delete exam
- `GET /api/exams/{id}/results` - Get exam results
- `POST /api/exams/{id}/results` - Add exam result
- `PUT /api/exams/{id}/results/{resultId}` - Update exam result
- `GET /api/exams/upcoming` - Get upcoming exams
- `GET /api/exams/class/{classId}` - Get exams by class
- `GET /api/exams/{id}/statistics` - Get exam statistics

## Setup Instructions

### 1. Backend Setup (Laravel)
```bash
cd backend-laravel

# Install dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=risa_management
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run migrations
php artisan migrate

# Run seeders (optional)
php artisan db:seed

# Start development server
php artisan serve
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Configuration
Update `frontend/src/config.js` with your backend URL:
```javascript
const config = {
  api: {
    // Development
    baseURL: 'http://localhost:8000/api',
    
    // Production
    // baseURL: 'https://your-domain.com/api',
  },
  // ... other config
};
```

## Key Features

### 1. Authentication
- Laravel Sanctum token-based authentication
- Automatic token management in frontend
- Secure logout with server-side token invalidation

### 2. Data Validation
- Comprehensive server-side validation
- Proper error messages and status codes
- Client-side error handling

### 3. Relationships
- Proper Eloquent relationships between models
- Efficient database queries with eager loading
- Nested data retrieval

### 4. Security
- CSRF protection
- Input sanitization
- SQL injection prevention
- XSS protection

### 5. API Features
- Pagination support
- Search and filtering
- Bulk operations
- Statistics and reporting
- File upload support (ready for implementation)

## Migration Checklist

- [x] Laravel backend setup
- [x] Database migrations
- [x] Model relationships
- [x] API controllers
- [x] Authentication system
- [x] Frontend API service
- [x] Configuration management
- [x] Error handling
- [x] Documentation

## Next Steps

1. **Test all endpoints** using Postman or similar tool
2. **Update remaining frontend components** to use the new API service
3. **Implement file upload functionality** for documents and images
4. **Add real-time notifications** using Laravel WebSockets
5. **Set up production deployment** with proper environment variables
6. **Add comprehensive testing** with PHPUnit and Jest

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure Laravel CORS is configured properly
2. **Authentication Issues**: Check token format and expiration
3. **Database Connection**: Verify database credentials in `.env`
4. **API Endpoints**: Ensure all routes are properly defined in `routes/api.php`

### Debug Mode
Enable debug mode in Laravel for detailed error messages:
```php
// .env
APP_DEBUG=true
```

## Support
For issues or questions, refer to:
- Laravel Documentation: https://laravel.com/docs
- React Documentation: https://reactjs.org/docs
- API Documentation: Check the generated API documentation 