# Fix 504 Gateway Timeout in Railway

## Common Causes of 504 Errors

1. **Database Connection Issues**
2. **Missing Environment Variables**
3. **Incorrect Start Command**
4. **Memory/Resource Limits**
5. **Missing Dependencies**

## Step-by-Step Fix

### 1. Check Railway Logs
In Railway dashboard, check the logs for specific error messages.

### 2. Environment Variables (CRITICAL)
Make sure these are set in Railway dashboard:

```
APP_NAME="RISA Management System"
APP_ENV=production
APP_KEY=base64:+u49gyRzXOvzIttQU3kgtB5v3t0EynQ+NXaiTUuAIIc=
APP_DEBUG=true
APP_URL=https://your-railway-app-url.railway.app

DB_CONNECTION=mysql
DB_HOST=your-railway-mysql-host
DB_PORT=your-railway-mysql-port
DB_DATABASE=your-railway-database-name
DB_USERNAME=your-railway-username
DB_PASSWORD=your-railway-password

LOG_CHANNEL=stack
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### 3. Database Connection Test
In Railway console, run:
```bash
php artisan tinker --execute="try { DB::connection()->getPdo(); echo 'DB Connected!'; } catch(Exception \$e) { echo 'DB Error: ' . \$e->getMessage(); }"
```

### 4. Run Migrations
```bash
php artisan migrate --force
```

### 5. Clear All Caches
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### 6. Check Storage Permissions
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### 7. Test Basic Route
Create a simple test route in `routes/web.php`:
```php
Route::get('/test', function() {
    return response()->json(['status' => 'ok', 'message' => 'API is working']);
});
```

### 8. Optimize for Production
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Alternative Start Commands

Try these in Railway's start command:

**Option 1:**
```bash
php artisan serve --host=0.0.0.0 --port=$PORT
```

**Option 2:**
```bash
vendor/bin/heroku-php-apache2 public/
```

**Option 3:**
```bash
php -S 0.0.0.0:$PORT -t public public/index.php
```

## Debug Mode

Temporarily set `APP_DEBUG=true` to see detailed error messages in logs.

## Memory Issues

If it's a memory issue, add to Railway environment variables:
```
PHP_MEMORY_LIMIT=512M
```

## Check These Files Exist

Make sure these files are in your repository:
- `public/index.php`
- `bootstrap/app.php`
- `config/app.php`
- `.env.example`

## Final Test

After fixes, test with:
```bash
curl https://your-railway-app-url.railway.app/test
```

If still getting 504, check Railway's resource usage and consider upgrading the plan. 