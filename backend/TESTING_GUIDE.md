# RISA Backend Testing Guide

## Quick Start

1. **Start the server from the backend directory:**
   ```bash
   cd backend
   php -S localhost:8000 -t public
   ```

2. **Test the endpoints:**

### Basic Endpoints
- **Health Check:** `http://localhost:8000/health.php`
- **Test Endpoint:** `http://localhost:8000/test.php`
- **Main API:** `http://localhost:8000/index.php`
- **Auth Endpoint:** `http://localhost:8000/auth.php`
- **Students Endpoint:** `http://localhost:8000/students.php`

### Expected Responses

#### Health Check (`/health.php`)
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01 12:00:00",
  "service": "RISA Management System API",
  "version": "1.0.0"
}
```

#### Test Endpoint (`/test.php`)
```json
{
  "status": "success",
  "message": "Test endpoint working!",
  "timestamp": "2024-01-01 12:00:00",
  "server_info": {
    "php_version": "8.x.x",
    "server_software": "PHP Development Server",
    "request_uri": "/test.php"
  }
}
```

#### Main API (`/index.php`)
```json
{
  "status": "success",
  "message": "RISA Management System API",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health.php",
    "test": "/test.php",
    "auth": "/auth.php",
    "students": "/students.php",
    ...
  }
}
```

## Testing Checklist

- [ ] Health check returns 200 OK
- [ ] Test endpoint returns server info
- [ ] Main API lists all endpoints
- [ ] Auth endpoint accepts GET and POST
- [ ] Students endpoint returns JSON
- [ ] All endpoints have proper CORS headers
- [ ] No 404 errors on any endpoint

## Troubleshooting

### If you get 404 errors:
1. Make sure you're running the server from the `backend` directory
2. Use port 8000 (or any free port)
3. Access files directly with `.php` extension
4. Check that all files exist in the `public` directory

### If you get XAMPP dashboard:
1. You're accessing the wrong URL
2. Use `http://localhost:8000` not `http://localhost`
3. Make sure the PHP server is running on port 8000

### If CORS errors occur:
1. All endpoints include proper CORS headers
2. Test with a simple GET request first
3. Check browser console for specific errors

## Deployment Testing

After pushing to GitHub and deploying on Railway:

1. **Check Railway logs** for any startup errors
2. **Test the health endpoint** at your Railway URL
3. **Verify all endpoints** work with the Railway domain
4. **Update frontend** with the new Railway URL

## File Structure

```
backend/
├── public/
│   ├── index.php          # Main API entry point
│   ├── health.php         # Health check for Railway
│   ├── test.php           # Test endpoint
│   ├── auth.php           # Authentication endpoint
│   ├── students.php       # Students endpoint
│   └── .htaccess          # Apache configuration
├── railway.json           # Railway deployment config
└── TESTING_GUIDE.md       # This file
```

All endpoints are now direct PHP files for maximum compatibility with XAMPP and Railway. 