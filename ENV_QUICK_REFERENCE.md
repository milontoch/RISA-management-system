# Environment Variables Quick Reference

## 🚀 Quick Setup Commands

### Local Development
```bash
cd backend
php setup-env.php
```

### Railway Backend Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Set environment variables
railway variables set DB_HOST=your-railway-mysql-host
railway variables set DB_NAME=railway
railway variables set DB_USERNAME=root
railway variables set DB_PASSWORD=your-railway-mysql-password
railway variables set APP_NAME="RISA Management System"
railway variables set APP_ENV=production
railway variables set APP_DEBUG=false
railway variables set APP_URL=https://your-app-name.railway.app
railway variables set JWT_SECRET=your-super-secret-jwt-key-here
railway variables set SESSION_SECRET=your-session-secret-key-here
railway variables set UPLOAD_MAX_SIZE=10485760
railway variables set ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx
railway variables set FRONTEND_URL=https://your-frontend-app.vercel.app
railway variables set TIMEZONE=UTC
```

### Vercel Frontend Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login and set variables
vercel login
vercel env add VITE_API_URL
vercel env add VITE_APP_NAME
```

## 🔑 Generate Secure Keys

```bash
# JWT Secret (64 characters)
openssl rand -base64 48

# Session Secret (32 characters)
openssl rand -base64 24
```

## 📋 Required Variables Checklist

### Backend (Railway)
- [ ] `DB_HOST` - Database host
- [ ] `DB_NAME` - Database name
- [ ] `DB_USERNAME` - Database username
- [ ] `DB_PASSWORD` - Database password
- [ ] `APP_NAME` - Application name
- [ ] `APP_ENV` - Environment (production)
- [ ] `APP_DEBUG` - Debug mode (false)
- [ ] `APP_URL` - Backend URL
- [ ] `JWT_SECRET` - JWT signing key
- [ ] `SESSION_SECRET` - Session secret
- [ ] `UPLOAD_MAX_SIZE` - Max file size
- [ ] `ALLOWED_FILE_TYPES` - Allowed file extensions
- [ ] `FRONTEND_URL` - Frontend URL for CORS
- [ ] `TIMEZONE` - Application timezone

### Frontend (Vercel)
- [ ] `VITE_API_URL` - Backend API URL
- [ ] `VITE_APP_NAME` - Application name

## 🧪 Test Your Setup

### Backend Test
```bash
curl https://your-backend.railway.app/api/test-env
```

### Frontend Test
```javascript
fetch(import.meta.env.VITE_API_URL + '/api/health')
  .then(response => response.json())
  .then(data => console.log('Health check:', data));
```

## 🔧 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Database connection failed | Check `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` |
| CORS errors | Verify `FRONTEND_URL` is correct |
| Authentication fails | Ensure `JWT_SECRET` and `SESSION_SECRET` are set |
| File upload fails | Check `UPLOAD_MAX_SIZE` and `ALLOWED_FILE_TYPES` |

## 📞 Support

- **Backend Issues**: Check Railway logs
- **Frontend Issues**: Check Vercel logs
- **Database Issues**: Verify connection details in Railway dashboard
- **Environment Variables**: Use test endpoints to verify configuration 