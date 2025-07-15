<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ClassModel;
use App\Models\ClassSubject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    /**
     * Display a listing of teachers
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::where('role', 'teacher')->with(['classes', 'subjects']);
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $query->where(function($q) use ($request) {
                    $q->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('email', 'like', '%' . $request->search . '%')
                      ->orWhere('phone', 'like', '%' . $request->search . '%');
                });
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            $teachers = $query->orderBy('name')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $teachers->items(),
                'meta' => [
                    'current_page' => $teachers->currentPage(),
                    'per_page' => $teachers->perPage(),
                    'total' => $teachers->total(),
                    'last_page' => $teachers->lastPage(),
                ],
                'message' => 'Teachers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve teachers: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created teacher
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100',
                'email' => 'required|email|unique:users,email',
                'phone' => 'required|string|max:20|unique:users,phone',
                'password' => 'required|string|min:6',
                'address' => 'nullable|string',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other',
                'qualification' => 'nullable|string',
                'specialization' => 'nullable|string',
                'joining_date' => 'nullable|date',
                'status' => 'required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $teacher = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'password' => Hash::make($request->password),
                'address' => $request->address,
                'date_of_birth' => $request->date_of_birth,
                'gender' => $request->gender,
                'qualification' => $request->qualification,
                'specialization' => $request->specialization,
                'joining_date' => $request->joining_date,
                'status' => $request->status,
                'role' => 'teacher'
            ]);

            $teacher->load(['classes', 'subjects']);

            return response()->json([
                'success' => true,
                'data' => $teacher,
                'message' => 'Teacher created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create teacher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified teacher
     */
    public function show(User $teacher): JsonResponse
    {
        try {
            if ($teacher->role !== 'teacher') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a teacher'
                ], 404);
            }

            $teacher->load([
                'classes' => function($query) {
                    $query->with('students');
                },
                'subjects' => function($query) {
                    $query->with(['subject', 'class']);
                }
            ]);

            return response()->json([
                'success' => true,
                'data' => $teacher,
                'message' => 'Teacher retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve teacher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified teacher
     */
    public function update(Request $request, User $teacher): JsonResponse
    {
        try {
            if ($teacher->role !== 'teacher') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a teacher'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:100',
                'email' => 'sometimes|required|email|unique:users,email,' . $teacher->id,
                'phone' => 'sometimes|required|string|max:20|unique:users,phone,' . $teacher->id,
                'password' => 'nullable|string|min:6',
                'address' => 'nullable|string',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female,other',
                'qualification' => 'nullable|string',
                'specialization' => 'nullable|string',
                'joining_date' => 'nullable|date',
                'status' => 'sometimes|required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->except('password');
            
            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }

            $teacher->update($updateData);
            $teacher->load(['classes', 'subjects']);

            return response()->json([
                'success' => true,
                'data' => $teacher,
                'message' => 'Teacher updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update teacher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified teacher
     */
    public function destroy(User $teacher): JsonResponse
    {
        try {
            if ($teacher->role !== 'teacher') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a teacher'
                ], 404);
            }

            // Check if teacher is assigned to any classes
            $classCount = $teacher->classes()->count();
            if ($classCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete teacher. They are assigned to ' . $classCount . ' class(es).'
                ], 400);
            }

            // Check if teacher is assigned to any subjects
            $subjectCount = $teacher->subjects()->count();
            if ($subjectCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete teacher. They are assigned to ' . $subjectCount . ' subject(s).'
                ], 400);
            }

            $teacher->delete();

            return response()->json([
                'success' => true,
                'message' => 'Teacher deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete teacher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get classes taught by teacher
     */
    public function getClasses(User $teacher): JsonResponse
    {
        try {
            if ($teacher->role !== 'teacher') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a teacher'
                ], 404);
            }

            $classes = $teacher->classes()->with(['students', 'subjects'])->get();

            return response()->json([
                'success' => true,
                'data' => $classes,
                'message' => 'Teacher classes retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve teacher classes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subjects taught by teacher
     */
    public function getSubjects(User $teacher): JsonResponse
    {
        try {
            if ($teacher->role !== 'teacher') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a teacher'
                ], 404);
            }

            $subjects = $teacher->subjects()->with(['subject', 'class'])->get();

            return response()->json([
                'success' => true,
                'data' => $subjects,
                'message' => 'Teacher subjects retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve teacher subjects: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get teacher dashboard data
     */
    public function dashboard(User $teacher): JsonResponse
    {
        try {
            if ($teacher->role !== 'teacher') {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a teacher'
                ], 404);
            }

            $totalClasses = $teacher->classes()->count();
            $totalSubjects = $teacher->subjects()->count();
            $totalStudents = $teacher->classes()->withCount('students')->get()->sum('students_count');

            $recentClasses = $teacher->classes()->with('students')->latest()->take(5)->get();
            $recentSubjects = $teacher->subjects()->with(['subject', 'class'])->latest()->take(5)->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'total_classes' => $totalClasses,
                    'total_subjects' => $totalSubjects,
                    'total_students' => $totalStudents,
                    'recent_classes' => $recentClasses,
                    'recent_subjects' => $recentSubjects
                ],
                'message' => 'Teacher dashboard data retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve teacher dashboard: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active teachers
     */
    public function getActive(): JsonResponse
    {
        try {
            $teachers = User::where('role', 'teacher')
                           ->where('status', 'active')
                           ->orderBy('name')
                           ->get(['id', 'name', 'email', 'phone']);

            return response()->json([
                'success' => true,
                'data' => $teachers,
                'message' => 'Active teachers retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active teachers: ' . $e->getMessage()
            ], 500);
        }
    }
}
