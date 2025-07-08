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

// Simple health check for Railway
if ($_SERVER['REQUEST_URI'] === '/' || $_SERVER['REQUEST_URI'] === '/health') {
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'service' => 'RISA Management System Backend',
        'version' => '1.0.0',
        'environment' => $_ENV['APP_ENV'] ?? 'production'
    ]);
    exit;
}

// Handle /api/health specifically for Railway health check
if ($_SERVER['REQUEST_URI'] === '/api/health') {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'service' => 'RISA Management System Backend',
        'version' => '1.0.0',
        'environment' => $_ENV['APP_ENV'] ?? 'production',
        'endpoint' => '/api/health'
    ]);
    exit;
}

// Set JSON content type
header('Content-Type: application/json');

// Include the API routes
require_once __DIR__ . '/../src/routes/api.php'; 