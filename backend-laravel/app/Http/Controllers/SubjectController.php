<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use App\Models\ClassSubject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class SubjectController extends Controller
{
    /**
     * Display a listing of subjects
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Subject::query();
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('code', 'like', '%' . $request->search . '%');
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            $subjects = $query->orderBy('name')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $subjects->items(),
                'meta' => [
                    'current_page' => $subjects->currentPage(),
                    'per_page' => $subjects->perPage(),
                    'total' => $subjects->total(),
                    'last_page' => $subjects->lastPage(),
                ],
                'message' => 'Subjects retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subjects: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created subject
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:100|unique:subjects',
                'code' => 'required|string|max:20|unique:subjects',
                'description' => 'nullable|string',
                'credits' => 'nullable|integer|min:1',
                'status' => 'required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $subject = Subject::create($request->all());

            return response()->json([
                'success' => true,
                'data' => $subject,
                'message' => 'Subject created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create subject: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified subject
     */
    public function show(Subject $subject): JsonResponse
    {
        try {
            $subject->load(['classes' => function($query) {
                $query->with('class');
            }]);

            return response()->json([
                'success' => true,
                'data' => $subject,
                'message' => 'Subject retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subject: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified subject
     */
    public function update(Request $request, Subject $subject): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:100|unique:subjects,name,' . $subject->id,
                'code' => 'sometimes|required|string|max:20|unique:subjects,code,' . $subject->id,
                'description' => 'nullable|string',
                'credits' => 'nullable|integer|min:1',
                'status' => 'sometimes|required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $subject->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $subject,
                'message' => 'Subject updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subject: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified subject
     */
    public function destroy(Subject $subject): JsonResponse
    {
        try {
            // Check if subject is assigned to any classes
            $classCount = ClassSubject::where('subject_id', $subject->id)->count();
            
            if ($classCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete subject. It is assigned to ' . $classCount . ' class(es).'
                ], 400);
            }

            $subject->delete();

            return response()->json([
                'success' => true,
                'message' => 'Subject deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete subject: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get subjects by class
     */
    public function getByClass($classId): JsonResponse
    {
        try {
            $subjects = Subject::whereHas('classes', function($query) use ($classId) {
                $query->where('class_id', $classId);
            })->with(['classes' => function($query) use ($classId) {
                $query->where('class_id', $classId)->with('teacher');
            }])->get();

            return response()->json([
                'success' => true,
                'data' => $subjects,
                'message' => 'Subjects for class retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve subjects for class: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get active subjects
     */
    public function getActive(): JsonResponse
    {
        try {
            $subjects = Subject::where('status', 'active')
                              ->orderBy('name')
                              ->get();

            return response()->json([
                'success' => true,
                'data' => $subjects,
                'message' => 'Active subjects retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve active subjects: ' . $e->getMessage()
            ], 500);
        }
    }
}
