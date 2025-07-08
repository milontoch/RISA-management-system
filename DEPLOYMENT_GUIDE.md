# RISA Management System - Deployment Guide

## Environment Variables Setup

### Step 1: Local Development Setup

1. **Copy the example environment file:**
   ```bash
   cd backend
   cp env.example .env
   ```

2. **Edit the .env file with your local values:**
   ```env
   # Database Configuration (for local development)
   DB_HOST=localhost
   DB_NAME=school_management
   DB_USERNAME=root
   DB_PASSWORD=

   # Application Configuration
   APP_NAME="RISA Management System"
   APP_ENV=development
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   # Security Configuration (generate secure keys)
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   SESSION_SECRET=your-session-secret-key-here-make-it-long-and-random

   # File Upload Configuration
   UPLOAD_MAX_SIZE=10485760
   ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx

   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:5173

   # Timezone
   TIMEZONE=UTC
   ```

### Step 2: Railway Backend Deployment

#### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

#### 2.2 Connect Your Repository
1. Click "Deploy from GitHub repo"
2. Select your RISA management system repository
3. Choose the `backend` directory as the source

#### 2.3 Set Environment Variables in Railway

**Method 1: Railway Dashboard**
1. Go to your project in Railway
2. Click on your service
3. Go to "Variables" tab
4. Add each environment variable:

```
DB_HOST=your-railway-mysql-host
DB_NAME=railway
DB_USERNAME=root
DB_PASSWORD=your-railway-mysql-password
APP_NAME="RISA Management System"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app-name.railway.app
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
SESSION_SECRET=your-session-secret-key-here-make-it-long-and-random
UPLOAD_MAX_SIZE=10485760
ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx
FRONTEND_URL=https://your-frontend-app.vercel.app
TIMEZONE=UTC
```

**Method 2: Railway CLI**
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Set variables:
   ```bash
   railway variables set DB_HOST=your-railway-mysql-host
   railway variables set DB_NAME=railway
   railway variables set DB_USERNAME=root
   railway variables set DB_PASSWORD=your-railway-mysql-password
   railway variables set APP_NAME="RISA Management System"
   railway variables set APP_ENV=production
   railway variables set APP_DEBUG=false
   railway variables set APP_URL=https://your-app-name.railway.app
   railway variables set JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   railway variables set SESSION_SECRET=your-session-secret-key-here-make-it-long-and-random
   railway variables set UPLOAD_MAX_SIZE=10485760
   railway variables set ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx
   railway variables set FRONTEND_URL=https://your-frontend-app.vercel.app
   railway variables set TIMEZONE=UTC
   ```

#### 2.4 Add MySQL Database
1. In Railway dashboard, click "New"
2. Select "Database" → "MySQL"
3. Railway will automatically provide connection details
4. Copy the connection details to your environment variables

### Step 3: Vercel Frontend Deployment

#### 3.1 Create Vercel Account
1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository

#### 3.2 Set Environment Variables in Vercel

**Method 1: Vercel Dashboard**
1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add the following variables:

```
VITE_API_URL=https://your-backend-app.railway.app
VITE_APP_NAME="RISA Management System"
```

**Method 2: Vercel CLI**
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Set variables:
   ```bash
   vercel env add VITE_API_URL
   vercel env add VITE_APP_NAME
   ```

### Step 4: Environment Variables Reference

#### Required Variables for Backend:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `DB_HOST` | Database host | `containers-us-west-1.railway.app` |
| `DB_NAME` | Database name | `railway` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your-railway-password` |
| `APP_NAME` | Application name | `"RISA Management System"` |
| `APP_ENV` | Environment | `production` |
| `APP_DEBUG` | Debug mode | `false` |
| `APP_URL` | Backend URL | `https://your-app.railway.app` |
| `JWT_SECRET` | JWT signing key | `long-random-string-here` |
| `SESSION_SECRET` | Session secret | `another-long-random-string` |
| `UPLOAD_MAX_SIZE` | Max file upload size | `10485760` |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-frontend.vercel.app` |
| `TIMEZONE` | Application timezone | `UTC` |

#### Required Variables for Frontend:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `VITE_API_URL` | Backend API URL | `https://your-backend.railway.app` |
| `VITE_APP_NAME` | Application name | `"RISA Management System"` |

### Step 5: Security Best Practices

#### 5.1 Generate Secure Keys
Use these commands to generate secure keys:

```bash
# Generate JWT Secret (64 characters)
openssl rand -base64 48

# Generate Session Secret (32 characters)
openssl rand -base64 24

# Or use online generators:
# https://generate-secret.vercel.app/64
# https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

#### 5.2 Environment-Specific Values

**Development (.env):**
```env
APP_ENV=development
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

**Production (Railway):**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-app.railway.app
FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 6: Testing Environment Variables

#### 6.1 Backend Test
Create a test endpoint to verify environment variables:

```php
// Add this to your API routes for testing
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/api/test-env') {
    echo json_encode([
        'database' => Config::getDatabaseConfig(),
        'app' => Config::getAppConfig(),
        'security' => array_keys(Config::getSecurityConfig()),
        'upload' => Config::getUploadConfig()
    ]);
    exit;
}
```

#### 6.2 Frontend Test
Add this to your frontend to test API connection:

```javascript
// Test API connection
fetch(import.meta.env.VITE_API_URL + '/api/test-env')
  .then(response => response.json())
  .then(data => console.log('Environment test:', data))
  .catch(error => console.error('API connection failed:', error));
```

### Step 7: Troubleshooting

#### Common Issues:

1. **Database Connection Failed**
   - Check `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
   - Verify database is running
   - Check firewall settings

2. **CORS Errors**
   - Verify `FRONTEND_URL` is correct
   - Check that frontend URL is in CORS allowed origins

3. **File Upload Issues**
   - Check `UPLOAD_MAX_SIZE` value
   - Verify `ALLOWED_FILE_TYPES` format

4. **Authentication Issues**
   - Ensure `JWT_SECRET` and `SESSION_SECRET` are set
   - Verify secrets are long and random

#### Debug Mode:
Set `APP_DEBUG=true` temporarily to see detailed error messages.

### Step 8: Deployment Checklist

- [ ] Backend environment variables set in Railway
- [ ] Frontend environment variables set in Vercel
- [ ] Database connection tested
- [ ] API endpoints responding
- [ ] CORS configured correctly
- [ ] File uploads working
- [ ] Authentication working
- [ ] All features tested
- [ ] Debug mode disabled in production
- [ ] Security keys are secure and unique

### Step 9: Monitoring

After deployment, monitor:
- Application logs in Railway
- Error rates
- Database performance
- API response times
- User authentication success rates 