# Railway Deployment Guide for RISA Management System

## Environment Variables Setup

Add these environment variables in your Railway dashboard:

### Database Configuration
```
DB_CONNECTION=mysql
DB_HOST=your-railway-mysql-host
DB_PORT=your-railway-mysql-port
DB_DATABASE=your-railway-database-name
DB_USERNAME=your-railway-username
DB_PASSWORD=your-railway-password
```

### Application Configuration
```
APP_NAME="RISA Management System"
APP_ENV=production
APP_KEY=base64:+u49gyRzXOvzIttQU3kgtB5v3t0EynQ+NXaiTUuAIIc=
APP_DEBUG=false
APP_URL=https://your-railway-app-url.railway.app
```

### Other Important Variables
```
LOG_CHANNEL=stack
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
```

## Post-Deployment Steps

After setting up environment variables, run these commands in Railway's console:

1. **Run Migrations:**
   ```bash
   php artisan migrate
   ```

2. **Seed the Database:**
   ```bash
   php artisan db:seed
   ```

3. **Clear Caches:**
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan route:clear
   ```

## API Endpoints

Your API will be available at:
- Base URL: `https://your-railway-app-url.railway.app/api`
- Login: `POST /api/login`
- Register: `POST /api/register`

## Default Admin Credentials
- Email: `admin@risa.edu`
- Password: `admin123`

## Important Notes

1. **Don't edit `.env` file** - Railway uses environment variables
2. **Don't run `configure-db.php`** - Railway handles database setup
3. **Use Railway's MySQL service** - Don't use external databases unless necessary
4. **Set APP_DEBUG=false** for production security

## Troubleshooting

If you get database connection errors:
1. Check that all DB_* environment variables are set correctly
2. Ensure Railway MySQL service is running
3. Verify the database credentials in Railway dashboard

If you get 500 errors:
1. Check Railway logs for specific error messages
2. Ensure APP_KEY is set correctly
3. Run `php artisan config:clear` in Railway console 