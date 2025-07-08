<?php
echo "<h1>RISA Management System - Backend Test</h1>";
echo "<p>PHP server is working correctly!</p>";
echo "<p>Current time: " . date('Y-m-d H:i:s') . "</p>";
echo "<p>Request URI: " . $_SERVER['REQUEST_URI'] . "</p>";

echo "<h2>Test Endpoints:</h2>";
echo "<ul>";
echo "<li><a href='/health.php'>Health Check</a></li>";
echo "<li><a href='/api/health'>API Health</a></li>";
echo "<li><a href='/api/test-env'>Environment Test</a></li>";
echo "<li><a href='/'>Root Page</a></li>";
echo "</ul>";
?> 