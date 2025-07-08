<?php
// Include configuration
require_once __DIR__ . '/config.php';

// Get database configuration
$dbConfig = Config::getDatabaseConfig();

// Create MySQL connection
$conn = new mysqli($dbConfig['host'], $dbConfig['username'], $dbConfig['password'], $dbConfig['dbname']);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4"); 