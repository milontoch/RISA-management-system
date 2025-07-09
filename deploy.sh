#!/bin/bash

echo "🚀 RISA Management System - Deployment Script"
echo "=============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📋 Prerequisites Check:"
echo "1. Make sure you have committed all changes to Git"
echo "2. Ensure you have Railway CLI installed (optional)"
echo "3. Ensure you have GitHub CLI installed (optional)"
echo ""

read -p "Have you committed all changes? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please commit your changes first"
    exit 1
fi

echo ""
echo "🔧 Backend Deployment (Railway)"
echo "================================"
echo "1. Go to https://railway.app"
echo "2. Create a new project from GitHub"
echo "3. Select the 'backend-laravel' directory"
echo "4. Add a MySQL database"
echo "5. Configure environment variables:"
echo "   - DB_CONNECTION=mysql"
echo "   - DB_HOST=\${MYSQL_HOST}"
echo "   - DB_PORT=\${MYSQL_PORT}"
echo "   - DB_DATABASE=\${MYSQLDATABASE}"
echo "   - DB_USERNAME=\${MYSQLUSER}"
echo "   - DB_PASSWORD=\${MYSQLPASSWORD}"
echo "   - APP_ENV=production"
echo "   - APP_DEBUG=false"
echo "   - APP_URL=https://your-railway-domain.up.railway.app"
echo ""

read -p "Enter your Railway app URL (e.g., https://risa-backend.up.railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
    echo "❌ Railway URL is required"
    exit 1
fi

echo ""
echo "🔧 Frontend Deployment (GitHub Pages)"
echo "====================================="

# Update the config file with the Railway URL
echo "📝 Updating frontend configuration..."
sed -i "s|https://risa-management-backend-production.up.railway.app|$RAILWAY_URL|g" frontend/src/config.js

echo "✅ Configuration updated"
echo ""

echo "🚀 Pushing changes to GitHub..."
git add .
git commit -m "Update API URL for production deployment"
git push origin main

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. Monitor Railway deployment at: https://railway.app"
echo "2. Monitor GitHub Actions at: https://github.com/your-username/RISA-management-system/actions"
echo "3. Once deployed, test the application:"
echo "   - Backend health check: $RAILWAY_URL/api/health"
echo "   - Frontend: https://your-username.github.io/RISA-management-system/"
echo ""
echo "🔑 Admin Login:"
echo "   - Email: admin@risa.edu"
echo "   - Password: admin123"
echo ""
echo "🎉 Deployment complete!" 