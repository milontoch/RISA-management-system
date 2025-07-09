# RISA Management System - Deployment Guide

This guide will help you deploy the RISA Management System to Railway (backend) and GitHub Pages (frontend).

## Prerequisites

1. **GitHub Account** - For hosting the repository and GitHub Pages
2. **Railway Account** - For hosting the Laravel backend
3. **Git** - For version control

## Backend Deployment (Railway)

### Step 1: Prepare the Backend

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Ensure these files are in your backend-laravel directory**:
   - `railway.json` - Railway configuration
   - `nixpacks.toml` - Build configuration
   - `Procfile` - Process definition
   - `.env` - Environment variables (will be overridden by Railway)

### Step 2: Deploy to Railway

1. **Go to [Railway.app](https://railway.app)** and sign in with GitHub
2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend-laravel` directory

3. **Add a MySQL database**:
   - In your Railway project, click "New"
   - Select "Database" → "MySQL"
   - Railway will automatically link it to your app

4. **Configure environment variables**:
   - Go to your app's "Variables" tab
   - Add these variables:
     ```
     DB_CONNECTION=mysql
     DB_HOST=${MYSQL_HOST}
     DB_PORT=${MYSQL_PORT}
     DB_DATABASE=${MYSQLDATABASE}
     DB_USERNAME=${MYSQLUSER}
     DB_PASSWORD=${MYSQLPASSWORD}
     APP_ENV=production
     APP_DEBUG=false
     APP_URL=https://your-railway-domain.up.railway.app
     ```

5. **Deploy**:
   - Railway will automatically detect the Laravel app
   - It will run the build commands from `nixpacks.toml`
   - The app will be available at your Railway domain

6. **Run migrations and seeders**:
   - Go to your app's "Deployments" tab
   - Click on the latest deployment
   - Open the terminal and run:
     ```bash
     php artisan migrate --force
     php artisan db:seed --class=AdminUserSeeder --force
     ```

### Step 3: Get Your Railway URL

- Copy your Railway app URL (e.g., `https://risa-management-backend-production.up.railway.app`)
- You'll need this for the frontend configuration

## Frontend Deployment (GitHub Pages)

### Step 1: Update Frontend Configuration

1. **Update the API base URL** in `frontend/src/config.js`:
   ```javascript
   baseURL: process.env.NODE_ENV === 'production' 
     ? 'https://your-railway-domain.up.railway.app/api'
     : 'http://localhost/RISA%20management%20system/backend-laravel/public/api',
   ```

2. **Commit and push the changes**:
   ```bash
   git add .
   git commit -m "Update API URL for production"
   git push origin main
   ```

### Step 2: Enable GitHub Pages

1. **Go to your GitHub repository**
2. **Navigate to Settings → Pages**
3. **Configure GitHub Pages**:
   - Source: "Deploy from a branch"
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. **Click "Save"**

### Step 3: Deploy

1. **The GitHub Actions workflow will automatically run** when you push to main
2. **Check the Actions tab** to monitor the deployment
3. **Your app will be available at**: `https://your-username.github.io/RISA-management-system/`

## Post-Deployment

### Step 1: Test the Application

1. **Test the backend API**:
   - Visit: `https://your-railway-domain.up.railway.app/api/health`
   - Should return: `{"status":"healthy","timestamp":"...","version":"1.0.0"}`

2. **Test the frontend**:
   - Visit your GitHub Pages URL
   - Try logging in with the admin account:
     - Email: `admin@risa.edu`
     - Password: `admin123`

### Step 2: Monitor and Maintain

1. **Railway Dashboard**:
   - Monitor app performance
   - Check logs for errors
   - Scale resources as needed

2. **GitHub Actions**:
   - Monitor deployment status
   - Check for build failures

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Add your GitHub Pages domain to Railway CORS settings
   - Or update the Laravel CORS configuration

2. **Database Connection Issues**:
   - Check Railway environment variables
   - Ensure MySQL service is running

3. **Build Failures**:
   - Check Railway build logs
   - Verify all dependencies are in `composer.json`

4. **Frontend Not Loading**:
   - Check GitHub Actions logs
   - Verify the base URL in Vite config

### Useful Commands

```bash
# Check Railway logs
railway logs

# Access Railway shell
railway shell

# Run Laravel commands on Railway
railway run php artisan migrate

# Check GitHub Actions status
# (Go to Actions tab in your GitHub repo)
```

## Security Notes

1. **Environment Variables**: Never commit sensitive data to Git
2. **Database**: Use Railway's managed MySQL service
3. **HTTPS**: Both Railway and GitHub Pages provide HTTPS by default
4. **API Keys**: Store them in Railway environment variables

## Cost Considerations

- **Railway**: Free tier available, pay-as-you-go pricing
- **GitHub Pages**: Free for public repositories
- **MySQL**: Included in Railway pricing

## Support

If you encounter issues:
1. Check Railway documentation: https://docs.railway.app
2. Check GitHub Pages documentation: https://pages.github.com
3. Review Laravel deployment guide: https://laravel.com/docs/deployment 