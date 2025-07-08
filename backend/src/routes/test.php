<?php
// Test endpoint to verify environment variables
require_once __DIR__ . '/../../config/config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/api/test-env') {
    // Don't expose sensitive information in production
    $isProduction = Config::get('APP_ENV') === 'production';
    
    $response = [
        'status' => 'success',
        'message' => 'Environment variables loaded successfully',
        'timestamp' => date('Y-m-d H:i:s'),
        'app' => [
            'name' => Config::get('APP_NAME'),
            'environment' => Config::get('APP_ENV'),
            'debug' => Config::get('APP_DEBUG'),
            'url' => Config::get('APP_URL'),
            'timezone' => Config::get('TIMEZONE')
        ],
        'database' => [
            'host' => Config::get('DB_HOST'),
            'name' => Config::get('DB_NAME'),
            'username' => Config::get('DB_USERNAME'),
            'connected' => false
        ],
        'upload' => [
            'max_size' => Config::get('UPLOAD_MAX_SIZE'),
            'allowed_types' => Config::get('ALLOWED_FILE_TYPES')
        ],
        'security' => [
            'jwt_secret_set' => !empty(Config::get('JWT_SECRET')),
            'session_secret_set' => !empty(Config::get('SESSION_SECRET'))
        ]
    ];
    
    // Test database connection
    try {
        $dbConfig = Config::getDatabaseConfig();
        $testConn = new mysqli($dbConfig['host'], $dbConfig['username'], $dbConfig['password'], $dbConfig['dbname']);
        
        if (!$testConn->connect_error) {
            $response['database']['connected'] = true;
            $response['database']['charset'] = $testConn->character_set_name();
            $testConn->close();
        } else {
            $response['database']['error'] = $testConn->connect_error;
        }
    } catch (Exception $e) {
        $response['database']['error'] = $e->getMessage();
    }
    
    // In production, don't expose sensitive details
    if ($isProduction) {
        unset($response['database']['username']);
        unset($response['database']['host']);
        $response['security']['jwt_secret_set'] = 'hidden';
        $response['security']['session_secret_set'] = 'hidden';
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

// Health check endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $_SERVER['REQUEST_URI'] === '/api/health') {
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'app' => Config::get('APP_NAME'),
        'version' => '1.0.0'
    ]);
    exit;
} 