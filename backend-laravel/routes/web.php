<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return view('dashboard');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/api-test', function () {
    return view('api-test');
});

// Test route for debugging Railway deployment
Route::get('/test', function() {
    return response()->json([
        'status' => 'ok', 
        'message' => 'API is working',
        'timestamp' => now(),
        'environment' => config('app.env')
    ]);
});

// Health check route
Route::get('/health', function() {
    try {
        DB::connection()->getPdo();
        return response()->json(['status' => 'healthy', 'database' => 'connected']);
    } catch (Exception $e) {
        return response()->json(['status' => 'unhealthy', 'database' => 'disconnected', 'error' => $e->getMessage()], 500);
    }
});

// API status route
Route::get('/api-status', function() {
    return response()->json([
        'api_status' => 'running',
        'endpoints' => [
            'login' => '/api/login',
            'dashboard' => '/api/dashboard',
            'users' => '/api/users',
            'students' => '/api/students',
            'teachers' => '/api/teachers',
        ],
        'test_credentials' => [
            'admin' => 'admin@risa.edu / admin123',
            'teacher' => 'teacher@risa.edu / teacher123',
            'parent' => 'parent@risa.edu / parent123'
        ]
    ]);
});
