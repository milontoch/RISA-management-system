<?php

namespace App\Http\Controllers;

use App\Models\ClassModel;
use App\Models\Student;
use App\Models\ClassSubject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ClassController extends Controller
{
    /**
     * Display a listing of classes
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ClassModel::with(['teacher', 'students'])->query();
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('section', 'like', '%' . $request->search . '%');
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by teacher
            if ($request->has('teacher_id')) {
                $query->where('teacher_id', $request->teacher_id);
            }
            
            $classes = $query->orderBy('name')->orderBy('section')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $classes->items(),
                'meta' => [
                    'current_page' => $classes->currentPage(),
                    'per_page' => $classes->perPage(),
                    'total' => $classes->total(),
                    'last_page' => $classes->lastPage(),
                ],
                'message' => 'Classes retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve classes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created class
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:50',
                'section' => 'required|string|max:10',
                'teacher_id' => 'required|exists:users,id',
                'capacity' => 'nullable|integer|min:1',
                'description' => 'nullable|string',
                'status' => 'required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if class with same name and section already exists
            $existingClass = ClassModel::where('name', $request->name)
                                     ->where('section', $request->section)
                                     ->first();
            
            if ($existingClass) {
                return response()->json([
                    'success' => false,
                    'message' => 'Class with this name and section already exists'
                ], 422);
            }

            $class = ClassModel::create($request->all());
            $class->load('teacher');

            return response()->json([
                'success' => true,
                'data' => $class,
                'message' => 'Class created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified class
     */
    public function show(ClassModel $class): JsonResponse
    {
        try {
            $class->load([
                'teacher',
                'students',
                'subjects' => function($query) {
                    $query->with('subject', 'teacher');
                }
            ]);

            return response()->json([
                'success' => true,
                'data' => $class,
                'message' => 'Class retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified class
     */
    public function update(Request $request, ClassModel $class): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:50',
                'section' => 'sometimes|required|string|max:10',
                'teacher_id' => 'sometimes|required|exists:users,id',
                'capacity' => 'nullable|integer|min:1',
                'description' => 'nullable|string',
                'status' => 'sometimes|required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if class with same name and section already exists (excluding current class)
            if ($request->has('name') && $request->has('section')) {
                $existingClass = ClassModel::where('name', $request->name)
                                         ->where('section', $request->section)
                                         ->where('id', '!=', $class->id)
                                         ->first();
                
                if ($existingClass) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Class with this name and section already exists'
                    ], 422);
                }
            }

            $class->update($request->all());
            $class->load('teacher');

            return response()->json([
                'success' => true,
                'data' => $class,
                'message' => 'Class updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified class
     */
    public function destroy(ClassModel $class): JsonResponse
    {
        try {
            // Check if class has students
            $studentCount = $class->students()->count();
            if ($studentCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete class. It has ' . $studentCount . ' student(s) enrolled.'
                ], 400);
            }

            // Check if class has subjects assigned
            $subjectCount = $class->subjects()->count();
            if ($subjectCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete class. It has ' . $subjectCount . ' subject(s) assigned.'
                ], 400);
            }

            $class->delete();

            return response()->json([
                'success' => true,
                'message' => 'Class deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get students in a class
     */
    public function getStudents(ClassModel $class): JsonResponse
    {
        try {
            $students = $class->students()->with('parent')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $students,
                'message' => 'Class students retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve class students: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subjects in a class
     */
    public function getSubjects(ClassModel $class): JsonResponse
    {
        try {
            $subjects = $class->subjects()->with(['subject', 'teacher'])->get();

            return response()->json([
                'success' => true,
                'data' => $subjects,
                'message' => 'Class subjects retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve class subjects: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add subject to class
     */
    public function addSubject(Request $request, ClassModel $class): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'subject_id' => 'required|exists:subjects,id',
                'teacher_id' => 'required|exists:users,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if subject is already assigned to this class
            $existing = ClassSubject::where('class_id', $class->id)
                                   ->where('subject_id', $request->subject_id)
                                   ->first();
            
            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subject is already assigned to this class'
                ], 422);
            }

            $classSubject = ClassSubject::create([
                'class_id' => $class->id,
                'subject_id' => $request->subject_id,
                'teacher_id' => $request->teacher_id
            ]);

            $classSubject->load(['subject', 'teacher']);

            return response()->json([
                'success' => true,
                'data' => $classSubject,
                'message' => 'Subject added to class successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add subject to class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove subject from class
     */
    public function removeSubject(ClassModel $class, $subjectId): JsonResponse
    {
        try {
            $classSubject = ClassSubject::where('class_id', $class->id)
                                       ->where('subject_id', $subjectId)
                                       ->first();
            
            if (!$classSubject) {
                return response()->json([
                    'success' => false,
                    'message' => 'Subject is not assigned to this class'
                ], 404);
            }

            $classSubject->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subject removed from class successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove subject from class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active classes
     */
    public function getActive(): JsonResponse
    {
        try {
            $classes = ClassModel::where('status', 'active')
                                ->with('teacher')
                                ->orderBy('name')
                                ->orderBy('section')
                                ->get();

            return response()->json([
                'success' => true,
                'data' => $classes,
                'message' => 'Active classes retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active classes: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign a head teacher to a class
     */
    public function assignHeadTeacher(Request $request, $classId): JsonResponse
    {
        $request->validate([
            'teacher_id' => 'required|exists:users,id',
        ]);
        $class = ClassModel::findOrFail($classId);
        $class->head_teacher_id = $request->teacher_id;
        $class->save();
        return response()->json(['success' => true, 'message' => 'Head teacher assigned successfully.']);
    }

    /**
     * Unassign the head teacher from a class
     */
    public function unassignHeadTeacher($classId): JsonResponse
    {
        $class = ClassModel::findOrFail($classId);
        $class->head_teacher_id = null;
        $class->save();
        return response()->json(['success' => true, 'message' => 'Head teacher unassigned successfully.']);
    }
}
