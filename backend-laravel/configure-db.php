<?php

// Configure database settings
$envFile = '.env';
$envContent = file_get_contents($envFile);

// Update database configuration for MySQL
$replacements = [
    'DB_CONNECTION=mysql' => 'DB_CONNECTION=mysql',
    'DB_HOST=127.0.0.1' => 'DB_HOST=127.0.0.1',
    'DB_PORT=3306' => 'DB_PORT=3306',
    'DB_DATABASE=laravel' => 'DB_DATABASE=risa_management',
    'DB_USERNAME=root' => 'DB_USERNAME=root',
    'DB_PASSWORD=' => 'DB_PASSWORD=',
];

foreach ($replacements as $search => $replace) {
    $envContent = str_replace($search, $replace, $envContent);
}

// Update other important settings
$envContent = str_replace('APP_ENV=local', 'APP_ENV=local', $envContent);
$envContent = str_replace('APP_DEBUG=true', 'APP_DEBUG=true', $envContent);
$envContent = str_replace('APP_URL=http://localhost', 'APP_URL=http://localhost:8000', $envContent);

file_put_contents($envFile, $envContent);

echo "Database configuration updated successfully!\n";
echo "Please make sure you have:\n";
echo "1. MySQL server running\n";
echo "2. Database 'risa_management' created\n";
echo "3. User 'root' with no password (or update DB_PASSWORD in .env)\n";
?> 