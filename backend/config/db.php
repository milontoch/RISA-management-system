<?php
// Database configuration
$host = 'localhost';
$dbname = 'school_management';
$username = 'root';
$password = '';

// Create MySQL connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Set charset
$conn->set_charset("utf8mb4"); 