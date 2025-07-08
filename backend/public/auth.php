<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo json_encode([
            'status' => 'success',
            'message' => 'Auth endpoint working',
            'method' => 'GET',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        echo json_encode([
            'status' => 'success',
            'message' => 'Auth endpoint working',
            'method' => 'POST',
            'received_data' => $input,
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'status' => 'error',
            'message' => 'Method not allowed',
            'allowed_methods' => ['GET', 'POST']
        ]);
        break;
}
?> 