<?php
// Health check endpoint for Railway
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Simple health check response
echo json_encode([
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'service' => 'RISA Management System Backend',
    'version' => '1.0.0',
    'environment' => $_ENV['APP_ENV'] ?? 'production',
    'endpoint' => '/api/health'
]);
?> 