<?php
// Simple health check endpoint
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'service' => 'RISA Management System Backend',
    'version' => '1.0.0',
    'environment' => $_ENV['APP_ENV'] ?? 'production'
]);
?> 