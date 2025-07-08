<?php
// Test file to verify routing
echo "<h1>Route Testing</h1>";
echo "<pre>";

echo "Current Request URI: " . $_SERVER['REQUEST_URI'] . "\n";
echo "Current Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Script Name: " . $_SERVER['SCRIPT_NAME'] . "\n";
echo "PHP Self: " . $_SERVER['PHP_SELF'] . "\n";

echo "\n--- Testing Routes ---\n";

// Test if files exist
$files_to_check = [
    'index.php' => __DIR__ . '/index.php',
    'index.html' => __DIR__ . '/index.html',
    'api.php' => __DIR__ . '/../src/routes/api.php',
    'config.php' => __DIR__ . '/../config/config.php'
];

foreach ($files_to_check as $name => $path) {
    if (file_exists($path)) {
        echo "✅ $name exists at: $path\n";
    } else {
        echo "❌ $name NOT found at: $path\n";
    }
}

echo "\n--- End Test ---\n";
echo "</pre>";
?> 