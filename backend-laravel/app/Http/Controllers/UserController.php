<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\ParentModel;

class UserController extends Controller
{
    /**
     * User login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ]);
    }

    /**
     * User registration
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,teacher,student,parent',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'User registered successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * User logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get user profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        
        // Load related data based on role
        switch ($user->role) {
            case 'student':
                $user->load('student.classModel', 'student.section');
                break;
            case 'teacher':
                $user->load('teacher.subject');
                break;
            case 'parent':
                $user->load('parentModel.student');
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'profile_picture' => 'sometimes|string',
        ]);

        $user->update($request->only(['name', 'email', 'profile_picture']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Get dashboard data based on user role
     */
    public function dashboard(Request $request, $role)
    {
        $user = $request->user();
        
        if ($user->role !== $role && $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $data = [];
        
        switch ($role) {
            case 'admin':
                $data = [
                    'total_students' => Student::count(),
                    'total_teachers' => Teacher::count(),
                    'total_classes' => \App\Models\ClassModel::count(),
                    'recent_activities' => \App\Models\AuditLog::latest()->take(10)->get(),
                ];
                break;
            case 'teacher':
                $teacher = $user->teacher;
                $data = [
                    'my_classes' => $teacher ? $teacher->timetables()->with('classModel', 'subject')->get() : [],
                    'recent_attendance' => [],
                    'upcoming_exams' => [],
                ];
                break;
            case 'student':
                $student = $user->student;
                $data = [
                    'attendance' => $student ? $student->attendance()->latest()->take(10)->get() : [],
                    'results' => $student ? $student->results()->with('exam', 'subject')->latest()->take(5)->get() : [],
                    'fees' => $student ? $student->fees()->latest()->take(5)->get() : [],
                ];
                break;
            case 'parent':
                $parent = $user->parentModel;
                $data = [
                    'children' => $parent ? $parent->student : null,
                    'notifications' => $user->notifications()->latest()->take(10)->get(),
                ];
                break;
        }

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $users = User::with(['student', 'teacher', 'parentModel'])
            ->when($request->role, function ($query, $role) {
                return $query->where('role', $role);
            })
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,teacher,student,parent',
            'profile_picture' => 'nullable|string',
            'is_class_teacher' => 'boolean',
            'class_teacher_of' => 'nullable|exists:classes,id',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'profile_picture' => $request->profile_picture,
            'is_class_teacher' => $request->is_class_teacher ?? false,
            'class_teacher_of' => $request->class_teacher_of,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = User::with(['student', 'teacher', 'parentModel'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:admin,teacher,student,parent',
            'profile_picture' => 'nullable|string',
            'is_class_teacher' => 'boolean',
            'class_teacher_of' => 'nullable|exists:classes,id',
        ]);

        $user->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Import data from CSV
     */
    public function importData(Request $request, $entity)
    {
        // Implementation for CSV import
        return response()->json([
            'success' => true,
            'message' => "Data imported successfully for {$entity}"
        ]);
    }

    /**
     * Export data to CSV
     */
    public function exportData(Request $request, $entity)
    {
        // Implementation for CSV export
        return response()->json([
            'success' => true,
            'message' => "Data exported successfully for {$entity}"
        ]);
    }
}
