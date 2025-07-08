<?php
/**
 * RISA Management System - Environment Setup Script
 * Run this script to quickly set up your local environment
 */

echo "=== RISA Management System Environment Setup ===\n\n";

// Check if .env file exists
if (file_exists('.env')) {
    echo "⚠️  .env file already exists!\n";
    echo "Do you want to overwrite it? (y/N): ";
    $handle = fopen("php://stdin", "r");
    $line = fgets($handle);
    fclose($handle);
    
    if (trim(strtolower($line)) !== 'y') {
        echo "Setup cancelled.\n";
        exit;
    }
}

echo "Setting up environment variables...\n\n";

// Generate secure keys
$jwt_secret = base64_encode(random_bytes(48));
$session_secret = base64_encode(random_bytes(24));

// Create .env content
$env_content = "# RISA Management System Environment Variables\n";
$env_content .= "# Generated on " . date('Y-m-d H:i:s') . "\n\n";

$env_content .= "# Database Configuration (for local development)\n";
$env_content .= "DB_HOST=localhost\n";
$env_content .= "DB_NAME=school_management\n";
$env_content .= "DB_USERNAME=root\n";
$env_content .= "DB_PASSWORD=\n\n";

$env_content .= "# Application Configuration\n";
$env_content .= "APP_NAME=\"RISA Management System\"\n";
$env_content .= "APP_ENV=development\n";
$env_content .= "APP_DEBUG=true\n";
$env_content .= "APP_URL=http://localhost:8000\n\n";

$env_content .= "# Security Configuration (auto-generated)\n";
$env_content .= "JWT_SECRET={$jwt_secret}\n";
$env_content .= "SESSION_SECRET={$session_secret}\n\n";

$env_content .= "# File Upload Configuration\n";
$env_content .= "UPLOAD_MAX_SIZE=10485760\n";
$env_content .= "ALLOWED_FILE_TYPES=jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx\n\n";

$env_content .= "# Frontend URL (for CORS)\n";
$env_content .= "FRONTEND_URL=http://localhost:5173\n\n";

$env_content .= "# Timezone\n";
$env_content .= "TIMEZONE=UTC\n";

// Write .env file
if (file_put_contents('.env', $env_content)) {
    echo "✅ .env file created successfully!\n\n";
    echo "📋 Environment variables set:\n";
    echo "   - Database: localhost/school_management\n";
    echo "   - App URL: http://localhost:8000\n";
    echo "   - Frontend URL: http://localhost:5173\n";
    echo "   - JWT Secret: Generated\n";
    echo "   - Session Secret: Generated\n\n";
    
    echo "🔧 Next steps:\n";
    echo "   1. Update database credentials if needed\n";
    echo "   2. Start your local server\n";
    echo "   3. Test the application\n\n";
    
    echo "⚠️  Remember to:\n";
    echo "   - Never commit .env file to version control\n";
    echo "   - Use different secrets for production\n";
    echo "   - Update URLs when deploying\n\n";
    
} else {
    echo "❌ Failed to create .env file!\n";
    echo "Please check file permissions and try again.\n";
}

echo "=== Setup Complete ===\n"; 