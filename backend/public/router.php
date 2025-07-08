<?php
// Simple router for API endpoints
class SimpleRouter {
    private $routes = [];
    
    public function addRoute($method, $path, $handler) {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }
    
    public function handleRequest() {
        $request_uri = $_SERVER['REQUEST_URI'];
        $request_method = $_SERVER['REQUEST_METHOD'];
        
        // Remove query string
        $request_uri = parse_url($request_uri, PHP_URL_PATH);
        
        foreach ($this->routes as $route) {
            if ($route['method'] === $request_method && $route['path'] === $request_uri) {
                return call_user_func($route['handler']);
            }
        }
        
        // No route found
        http_response_code(404);
        echo json_encode([
            'error' => 'Route not found',
            'path' => $request_uri,
            'method' => $request_method
        ]);
    }
}

// Create router instance
$router = new SimpleRouter();

// Add routes
$router->addRoute('GET', '/api/health', function() {
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => date('Y-m-d H:i:s'),
        'service' => 'RISA Management System Backend',
        'version' => '1.0.0',
        'endpoint' => '/api/health'
    ]);
});

$router->addRoute('GET', '/api/test-env', function() {
    header('Content-Type: application/json');
    
    if (file_exists(__DIR__ . '/../config/config.php')) {
        require_once __DIR__ . '/../config/config.php';
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Environment variables loaded successfully',
            'timestamp' => date('Y-m-d H:i:s'),
            'app' => [
                'name' => Config::get('APP_NAME'),
                'environment' => Config::get('APP_ENV'),
                'debug' => Config::get('APP_DEBUG'),
                'url' => Config::get('APP_URL'),
                'timezone' => Config::get('TIMEZONE')
            ]
        ]);
    } else {
        echo json_encode([
            'status' => 'error',
            'message' => 'Config file not found',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
});

$router->addRoute('GET', '/', function() {
    if (file_exists(__DIR__ . '/index.html')) {
        readfile(__DIR__ . '/index.html');
    } else {
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'service' => 'RISA Management System Backend',
            'version' => '1.0.0',
            'message' => 'API is running'
        ]);
    }
});

// Handle the request
$router->handleRequest();
?> 