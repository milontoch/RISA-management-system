<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get the request URI
$request_uri = $_SERVER['REQUEST_URI'];
$request_method = $_SERVER['REQUEST_METHOD'];

// Debug: Log the request
error_log("Request URI: " . $request_uri);
error_log("Request Method: " . $request_method);

// Handle root path - show HTML page
if ($request_uri === '/' || $request_uri === '/index.html') {
    if (file_exists(__DIR__ . '/index.html')) {
        readfile(__DIR__ . '/index.html');
    } else {
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'service' => 'RISA Management System Backend',
            'version' => '1.0.0',
            'message' => 'API is running'
        ]);
    }
    exit;
}

// Handle /api/health endpoint specifically
if ($request_uri === '/api/health') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'service' => 'RISA Management System Backend',
        'version' => '1.0.0',
        'endpoint' => '/api/health',
        'method' => $request_method
    ]);
    exit;
}

// Handle /api/test-env endpoint
if ($request_uri === '/api/test-env') {
    header('Content-Type: application/json');
    
    // Check if config file exists
    if (file_exists(__DIR__ . '/../config/config.php')) {
        require_once __DIR__ . '/../config/config.php';
        
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
            ]
        ];
    } else {
        $response = [
            'status' => 'error',
            'message' => 'Config file not found',
            'timestamp' => date('Y-m-d H:i:s')
        ];
    }
    
    echo json_encode($response);
    exit;
}

// Set JSON content type for API responses
header('Content-Type: application/json');

// Include the main API routes
if (file_exists(__DIR__ . '/../src/routes/api.php')) {
    require_once __DIR__ . '/../src/routes/api.php';
} else {
    echo json_encode([
        'status' => 'error',
        'message' => 'API routes file not found',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
} 