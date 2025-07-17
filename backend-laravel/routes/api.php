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
use App\Http\Controllers\AcademicYearController;

// API Version 1
Route::prefix('v1')->group(function () {
    // Public routes
    // Route::post('/register', [UserController::class, 'register']); // Registration disabled
    Route::post('/login', [UserController::class, 'login']);

    // Protected routes
    Route::middleware(['auth:sanctum', 'role:admin,teacher'])->group(function () {
        // User management
        Route::post('/logout', [UserController::class, 'logout']);
        Route::get('/profile', [UserController::class, 'profile']);
        Route::put('/profile', [UserController::class, 'updateProfile']);
        Route::get('/dashboard/{role}', [UserController::class, 'dashboard']);
        Route::apiResource('users', UserController::class);

        // Student management (data only, not users)
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
        Route::post('/classes/{class}/assign-head-teacher', [ClassController::class, 'assignHeadTeacher'])->middleware('role:admin');
        Route::post('/classes/{class}/unassign-head-teacher', [ClassController::class, 'unassignHeadTeacher'])->middleware('role:admin');
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

        // Academic year management
        Route::get('/academic-years', [AcademicYearController::class, 'index']);
        Route::post('/academic-years', [AcademicYearController::class, 'store']);
        Route::get('/academic-years/{id}', [AcademicYearController::class, 'show']);
        Route::put('/academic-years/{id}', [AcademicYearController::class, 'update']);
        Route::post('/academic-years/{id}/toggle-active', [AcademicYearController::class, 'toggleActive']);
        Route::get('/academic-years/active', [AcademicYearController::class, 'getActiveYear']);

        // Student promotion and inactivity
        Route::post('/students/promote', [StudentController::class, 'promoteStudents'])->middleware('role:admin');
        Route::post('/students/check-inactivity', [StudentController::class, 'checkInactivity'])->middleware('role:admin');
    });

    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        Route::get('/academic-years', [AcademicYearController::class, 'index']);
        Route::get('/academic-years/current', [AcademicYearController::class, 'current']);
        Route::post('/academic-years', [AcademicYearController::class, 'store']);
        Route::put('/academic-years/{academicYear}', [AcademicYearController::class, 'update']);
        Route::post('/academic-years/{academicYear}/activate', [AcademicYearController::class, 'activate']);
    });

    // Admin-only routes
    Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
        // User, academic year, class management, etc.
        // Route::apiResource('users', UserController::class);
        // Route::apiResource('academic-years', AcademicYearController::class);
        // ... other admin routes ...
    });

    // Head Teacher routes
    Route::middleware(['auth:sanctum', 'head_teacher'])->group(function () {
        // Attendance for their class
        // Route::get('/attendance/my-class', [AttendanceController::class, 'myClass']);
        // ... other head teacher routes ...
    });

    // Teacher routes
    Route::middleware(['auth:sanctum', 'role:teacher'])->group(function () {
        // Route::get('/attendance', [AttendanceController::class, 'index']);
        // ... other teacher routes ...
    });

    // Student routes (optional)
    Route::middleware(['auth:sanctum', 'role:student'])->group(function () {
        // Student-only endpoints
    });
}); 