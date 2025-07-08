<?php
// Debug file to check routing
echo "<h1>Debug Information</h1>";
echo "<pre>";

echo "REQUEST_URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "REQUEST_METHOD: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "SCRIPT_NAME: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "PHP_SELF: " . $_SERVER['PHP_SELF'] . "\n";
echo "QUERY_STRING: " . ($_SERVER['QUERY_STRING'] ?? 'none') . "\n";

echo "\n--- Testing Health Endpoint ---\n";

// Simulate the health check
$_SERVER['REQUEST_URI'] = '/api/health';
$_SERVER['REQUEST_METHOD'] = 'GET';

echo "Testing /api/health...\n";

// Include the test routes
if (file_exists(__DIR__ . '/../src/routes/test.php')) {
    echo "test.php file exists\n";
    require_once __DIR__ . '/../src/routes/test.php';
} else {
    echo "test.php file NOT found\n";
}

echo "\n--- End Debug ---\n";
echo "</pre>";
?> 