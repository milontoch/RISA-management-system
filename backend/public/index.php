<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = trim($path, '/');

// Remove 'public' from path if present
if (strpos($path, 'public/') === 0) {
    $path = substr($path, 7);
}

// Simple routing
switch ($path) {
    case '':
    case 'index.php':
        echo json_encode([
            'status' => 'success',
            'message' => 'RISA Management System API',
            'version' => '1.0.0',
            'endpoints' => [
                'health' => '/health.php',
                'test' => '/test.php',
                'auth' => '/auth.php',
                'students' => '/students.php',
                'teachers' => '/teachers.php',
                'classes' => '/classes.php',
                'subjects' => '/subjects.php',
                'attendance' => '/attendance.php',
                'exams' => '/exams.php',
                'results' => '/results.php',
                'fees' => '/fees.php',
                'timetable' => '/timetable.php',
                'messages' => '/messages.php',
                'notifications' => '/notifications.php',
                'reports' => '/reports.php',
                'documents' => '/documents.php',
                'users' => '/users.php'
            ]
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Endpoint not found',
            'path' => $path,
            'available_endpoints' => [
                'health' => '/health.php',
                'test' => '/test.php'
            ]
        ]);
        break;
}
?> 