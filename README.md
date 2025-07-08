# RISA Management System

A comprehensive school management system built with React.js frontend and PHP backend, featuring role-based access control, real-time notifications, and mobile-responsive design.

## 🚀 Features

### Core Features
- **User Management**: Admin, Teacher, Student, and Parent roles
- **Class Management**: Create and manage classes and sections
- **Student Management**: Complete student profiles and records
- **Teacher Management**: Teacher assignments and profiles
- **Subject Management**: Course and subject organization
- **Attendance Tracking**: Daily attendance management
- **Exam Management**: Create and manage exams
- **Results Management**: Grade entry and result viewing
- **Fee Management**: Payment tracking and management
- **Timetable Management**: Class schedules and timetables
- **Document Management**: File upload and sharing
- **Messaging System**: Internal communication
- **Notifications**: Real-time notifications
- **Reports**: Comprehensive reporting system
- **Calendar**: Event management and scheduling

### Technical Features
- **Responsive Design**: Mobile-first approach
- **PWA Support**: Progressive Web App capabilities
- **Role-Based Access**: Secure permission system
- **Real-time Updates**: Live data synchronization
- **File Upload**: Document and image management
- **Search & Filter**: Advanced data filtering
- **Export/Import**: Data import/export functionality
- **Accessibility**: WCAG compliant design

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

### Backend
- **PHP** - Server-side language
- **MySQL** - Database
- **RESTful API** - API architecture
- **JWT** - Authentication

### Deployment
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **MySQL** - Database hosting

## 📋 Prerequisites

- Node.js (v16 or higher)
- PHP (v7.4 or higher)
- MySQL (v8.0 or higher)
- Git
- Composer (optional)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/risa-management-system.git
cd risa-management-system
```

### 2. Backend Setup
```bash
cd backend

# Set up environment variables
php setup-env.php

# Or manually copy and edit
cp env.example .env
# Edit .env with your database credentials

# Start PHP server (for development)
php -S localhost:8000 -t public
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Database Setup
```sql
-- Create database
CREATE DATABASE school_management;

-- Import schema
mysql -u root -p school_management < backend/database/schema.sql
```

## 🔧 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_NAME=school_management
DB_USERNAME=root
DB_PASSWORD=

APP_NAME="RISA Management System"
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000

JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-session-secret-key-here

UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx

FRONTEND_URL=http://localhost:5173
TIMEZONE=UTC
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_APP_NAME="RISA Management System"
```

## 🚀 Deployment

### Backend Deployment (Railway)
1. Create Railway account
2. Connect GitHub repository
3. Set environment variables
4. Add MySQL database
5. Deploy

### Frontend Deployment (Vercel)
1. Create Vercel account
2. Import GitHub repository
3. Set environment variables
4. Deploy

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions.

## 📱 PWA Features

- **Offline Support**: Basic offline functionality
- **Install Prompt**: Add to home screen
- **Push Notifications**: Real-time updates
- **Background Sync**: Data synchronization

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **Role-Based Access**: Granular permissions
- **Input Validation**: Server-side validation
- **CORS Protection**: Cross-origin security
- **SQL Injection Prevention**: Prepared statements

## 📊 API Documentation

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/password-reset/request` - Request password reset
- `POST /api/password-reset/reset` - Reset password

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `PUT /api/classes/{id}` - Update class
- `DELETE /api/classes/{id}` - Delete class

See [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md) for complete API reference.

## 🧪 Testing

### Backend Testing
```bash
# Test environment variables
curl http://localhost:8000/api/test-env

# Health check
curl http://localhost:8000/api/health
```

### Frontend Testing
```bash
# Run tests
npm test

# Test API connection
# Open browser console and run:
fetch(import.meta.env.VITE_API_URL + '/api/health')
  .then(response => response.json())
  .then(data => console.log('Health check:', data));
```

## 📁 Project Structure

```
risa-management-system/
├── backend/
│   ├── config/
│   │   ├── db.php
│   │   └── config.php
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   ├── database/
│   └── public/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── assets/
│   ├── public/
│   └── package.json
├── docs/
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Quick Reference**: [ENV_QUICK_REFERENCE.md](ENV_QUICK_REFERENCE.md)
- **API Docs**: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Issues**: [GitHub Issues](https://github.com/your-username/risa-management-system/issues)

## 🙏 Acknowledgments

- React.js community
- PHP community
- Tailwind CSS team
- Railway and Vercel for hosting

---

**Made with ❤️ for educational institutions** 