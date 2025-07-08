<?php
// Simple test script to verify health endpoint
echo "Testing health endpoint...\n";

// Simulate the health check request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['REQUEST_URI'] = '/api/health';

// Include the test routes
require_once __DIR__ . '/src/routes/test.php';

echo "Health endpoint test completed.\n";
?> 