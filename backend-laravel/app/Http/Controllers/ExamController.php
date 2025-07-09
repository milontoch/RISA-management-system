<?php

namespace App\Http\Controllers;

use App\Models\Exam;
use App\Models\ExamResult;
use App\Models\ClassModel;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ExamController extends Controller
{
    /**
     * Display a listing of exams
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Exam::with(['class', 'subject']);
            
            // Search functionality
            if ($request->has('search') && $request->search) {
                $query->where('title', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
            }
            
            // Filter by class
            if ($request->has('class_id')) {
                $query->where('class_id', $request->class_id);
            }
            
            // Filter by subject
            if ($request->has('subject_id')) {
                $query->where('subject_id', $request->subject_id);
            }
            
            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            // Filter by date range
            if ($request->has('start_date')) {
                $query->where('exam_date', '>=', $request->start_date);
            }
            
            if ($request->has('end_date')) {
                $query->where('exam_date', '<=', $request->end_date);
            }
            
            $exams = $query->orderBy('exam_date', 'desc')->paginate(10);
            
            return response()->json([
                'success' => true,
                'data' => $exams,
                'message' => 'Exams retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exams: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created exam
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:100',
                'description' => 'nullable|string',
                'class_id' => 'required|exists:classes,id',
                'subject_id' => 'required|exists:subjects,id',
                'exam_date' => 'required|date',
                'start_time' => 'required|date_format:H:i',
                'end_time' => 'required|date_format:H:i|after:start_time',
                'total_marks' => 'required|integer|min:1',
                'passing_marks' => 'required|integer|min:1|lte:total_marks',
                'exam_type' => 'required|in:midterm,final,quiz,assignment',
                'status' => 'required|in:scheduled,ongoing,completed,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if exam with same title exists for the class and subject
            $existingExam = Exam::where('title', $request->title)
                               ->where('class_id', $request->class_id)
                               ->where('subject_id', $request->subject_id)
                               ->first();
            
            if ($existingExam) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam with this title already exists for this class and subject'
                ], 422);
            }

            $exam = Exam::create($request->all());
            $exam->load(['class', 'subject']);

            return response()->json([
                'success' => true,
                'data' => $exam,
                'message' => 'Exam created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create exam: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified exam
     */
    public function show(Exam $exam): JsonResponse
    {
        try {
            $exam->load([
                'class' => function($query) {
                    $query->with('students');
                },
                'subject',
                'results' => function($query) {
                    $query->with('student');
                }
            ]);

            return response()->json([
                'success' => true,
                'data' => $exam,
                'message' => 'Exam retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exam: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified exam
     */
    public function update(Request $request, Exam $exam): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'sometimes|required|string|max:100',
                'description' => 'nullable|string',
                'class_id' => 'sometimes|required|exists:classes,id',
                'subject_id' => 'sometimes|required|exists:subjects,id',
                'exam_date' => 'sometimes|required|date',
                'start_time' => 'sometimes|required|date_format:H:i',
                'end_time' => 'sometimes|required|date_format:H:i|after:start_time',
                'total_marks' => 'sometimes|required|integer|min:1',
                'passing_marks' => 'sometimes|required|integer|min:1|lte:total_marks',
                'exam_type' => 'sometimes|required|in:midterm,final,quiz,assignment',
                'status' => 'sometimes|required|in:scheduled,ongoing,completed,cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if exam with same title exists for the class and subject (excluding current exam)
            if ($request->has('title') && $request->has('class_id') && $request->has('subject_id')) {
                $existingExam = Exam::where('title', $request->title)
                                   ->where('class_id', $request->class_id)
                                   ->where('subject_id', $request->subject_id)
                                   ->where('id', '!=', $exam->id)
                                   ->first();
                
                if ($existingExam) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Exam with this title already exists for this class and subject'
                    ], 422);
                }
            }

            $exam->update($request->all());
            $exam->load(['class', 'subject']);

            return response()->json([
                'success' => true,
                'data' => $exam,
                'message' => 'Exam updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exam: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified exam
     */
    public function destroy(Exam $exam): JsonResponse
    {
        try {
            // Check if exam has results
            $resultCount = $exam->results()->count();
            if ($resultCount > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete exam. It has ' . $resultCount . ' result(s).'
                ], 400);
            }

            $exam->delete();

            return response()->json([
                'success' => true,
                'message' => 'Exam deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete exam: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get exam results
     */
    public function getResults(Exam $exam): JsonResponse
    {
        try {
            $results = $exam->results()->with('student')->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => 'Exam results retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exam results: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add exam result
     */
    public function addResult(Request $request, Exam $exam): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'student_id' => 'required|exists:students,id',
                'marks_obtained' => 'required|numeric|min:0|max:' . $exam->total_marks,
                'remarks' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if result already exists for this student and exam
            $existingResult = ExamResult::where('exam_id', $exam->id)
                                       ->where('student_id', $request->student_id)
                                       ->first();
            
            if ($existingResult) {
                return response()->json([
                    'success' => false,
                    'message' => 'Result already exists for this student'
                ], 422);
            }

            // Calculate percentage and status
            $percentage = ($request->marks_obtained / $exam->total_marks) * 100;
            $status = $request->marks_obtained >= $exam->passing_marks ? 'pass' : 'fail';

            $result = ExamResult::create([
                'exam_id' => $exam->id,
                'student_id' => $request->student_id,
                'marks_obtained' => $request->marks_obtained,
                'percentage' => round($percentage, 2),
                'status' => $status,
                'remarks' => $request->remarks
            ]);

            $result->load('student');

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Exam result added successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add exam result: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update exam result
     */
    public function updateResult(Request $request, Exam $exam, $resultId): JsonResponse
    {
        try {
            $result = ExamResult::where('exam_id', $exam->id)
                               ->where('id', $resultId)
                               ->first();
            
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exam result not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'marks_obtained' => 'sometimes|required|numeric|min:0|max:' . $exam->total_marks,
                'remarks' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $updateData = $request->all();
            
            if ($request->has('marks_obtained')) {
                $percentage = ($request->marks_obtained / $exam->total_marks) * 100;
                $status = $request->marks_obtained >= $exam->passing_marks ? 'pass' : 'fail';
                
                $updateData['percentage'] = round($percentage, 2);
                $updateData['status'] = $status;
            }

            $result->update($updateData);
            $result->load('student');

            return response()->json([
                'success' => true,
                'data' => $result,
                'message' => 'Exam result updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update exam result: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming exams
     */
    public function getUpcoming(): JsonResponse
    {
        try {
            $exams = Exam::where('exam_date', '>=', now()->toDateString())
                        ->where('status', 'scheduled')
                        ->with(['class', 'subject'])
                        ->orderBy('exam_date')
                        ->orderBy('start_time')
                        ->get();

            return response()->json([
                'success' => true,
                'data' => $exams,
                'message' => 'Upcoming exams retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve upcoming exams: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get exams by class
     */
    public function getByClass($classId): JsonResponse
    {
        try {
            $exams = Exam::where('class_id', $classId)
                        ->with(['subject', 'results'])
                        ->orderBy('exam_date', 'desc')
                        ->get();

            return response()->json([
                'success' => true,
                'data' => $exams,
                'message' => 'Class exams retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve class exams: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get exam statistics
     */
    public function getStatistics(Exam $exam): JsonResponse
    {
        try {
            $totalStudents = $exam->class->students()->count();
            $resultsCount = $exam->results()->count();
            $passCount = $exam->results()->where('status', 'pass')->count();
            $failCount = $exam->results()->where('status', 'fail')->count();
            
            $averageMarks = $exam->results()->avg('marks_obtained') ?? 0;
            $averagePercentage = $exam->results()->avg('percentage') ?? 0;
            
            $highestMarks = $exam->results()->max('marks_obtained') ?? 0;
            $lowestMarks = $exam->results()->min('marks_obtained') ?? 0;

            return response()->json([
                'success' => true,
                'data' => [
                    'total_students' => $totalStudents,
                    'results_count' => $resultsCount,
                    'pass_count' => $passCount,
                    'fail_count' => $failCount,
                    'pass_percentage' => $totalStudents > 0 ? round(($passCount / $totalStudents) * 100, 2) : 0,
                    'average_marks' => round($averageMarks, 2),
                    'average_percentage' => round($averagePercentage, 2),
                    'highest_marks' => $highestMarks,
                    'lowest_marks' => $lowestMarks
                ],
                'message' => 'Exam statistics retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve exam statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
