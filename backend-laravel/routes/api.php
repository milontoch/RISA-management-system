<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ExamController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\FeeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User management
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/dashboard/{role}', [UserController::class, 'dashboard']);
    
    // User resource routes
    Route::apiResource('users', UserController::class);
    
    // Student management
    Route::apiResource('students', StudentController::class);
    Route::get('/students/{student}/attendance', [StudentController::class, 'getAttendance']);
    Route::get('/students/{student}/results', [StudentController::class, 'getResults']);
    
    // Attendance management
    Route::apiResource('attendance', AttendanceController::class);
    Route::post('/attendance/bulk', [AttendanceController::class, 'bulkMark']);
    Route::get('/attendance/report', [AttendanceController::class, 'report']);
    Route::get('/attendance/class/{classId}', [AttendanceController::class, 'getByClass']);
    Route::get('/attendance/student/{studentId}', [AttendanceController::class, 'getByStudent']);
    
    // Subject management
    Route::apiResource('subjects', SubjectController::class);
    Route::get('/subjects/class/{classId}', [SubjectController::class, 'getByClass']);
    Route::get('/subjects/active', [SubjectController::class, 'getActive']);
    
    // Class management
    Route::apiResource('classes', ClassController::class);
    Route::get('/classes/{class}/students', [ClassController::class, 'getStudents']);
    Route::get('/classes/{class}/subjects', [ClassController::class, 'getSubjects']);
    Route::post('/classes/{class}/subjects', [ClassController::class, 'addSubject']);
    Route::delete('/classes/{class}/subjects/{subjectId}', [ClassController::class, 'removeSubject']);
    Route::get('/classes/active', [ClassController::class, 'getActive']);
    
    // Teacher management
    Route::apiResource('teachers', TeacherController::class);
    Route::get('/teachers/{teacher}/classes', [TeacherController::class, 'getClasses']);
    Route::get('/teachers/{teacher}/subjects', [TeacherController::class, 'getSubjects']);
    Route::get('/teachers/{teacher}/dashboard', [TeacherController::class, 'dashboard']);
    Route::get('/teachers/active', [TeacherController::class, 'getActive']);
    
    // Exam management
    Route::apiResource('exams', ExamController::class);
    Route::get('/exams/{exam}/results', [ExamController::class, 'getResults']);
    Route::post('/exams/{exam}/results', [ExamController::class, 'addResult']);
    Route::put('/exams/{exam}/results/{resultId}', [ExamController::class, 'updateResult']);
    Route::get('/exams/upcoming', [ExamController::class, 'getUpcoming']);
    Route::get('/exams/class/{classId}', [ExamController::class, 'getByClass']);
    Route::get('/exams/{exam}/statistics', [ExamController::class, 'getStatistics']);
    
    // Notification management
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    
    // Message management
    Route::apiResource('messages', MessageController::class);
    
    // Results management
    Route::apiResource('results', ResultController::class);
    
    // Fees management
    Route::apiResource('fees', FeeController::class);
}); 