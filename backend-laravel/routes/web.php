<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
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
