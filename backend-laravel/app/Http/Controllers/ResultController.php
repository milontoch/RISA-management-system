<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Result;
use App\Models\Exam;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;

class ResultController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $results = [];

        if ($user->role === 'admin') {
            $results = Result::with(['student.user', 'exam', 'subject'])
                ->when($request->exam_id, function ($query, $examId) {
                    return $query->where('exam_id', $examId);
                })
                ->when($request->student_id, function ($query, $studentId) {
                    return $query->where('student_id', $studentId);
                })
                ->when($request->class_id, function ($query, $classId) {
                    return $query->whereHas('student', function ($q) use ($classId) {
                        $q->where('class_id', $classId);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->paginate(15);
        } elseif ($user->role === 'teacher') {
            // Teachers can see results for their classes
            $teacher = $user->teacher;
            if ($teacher && $teacher->classModel) {
                $results = Result::with(['student.user', 'exam', 'subject'])
                    ->whereHas('student', function ($q) use ($teacher) {
                        $q->where('class_id', $teacher->classModel->id);
                    })
                    ->orderBy('created_at', 'desc')
                    ->paginate(15);
            }
        } elseif ($user->role === 'student') {
            // Students can see their own results
            $student = $user->student;
            if ($student) {
                $results = Result::with(['student.user', 'exam', 'subject'])
                    ->where('student_id', $student->id)
                    ->orderBy('created_at', 'desc')
                    ->paginate(15);
            }
        } elseif ($user->role === 'parent') {
            // Parents can see their children's results
            $parent = $user->parentModel;
            if ($parent && $parent->student) {
                $results = Result::with(['exam', 'subject'])
                    ->where('student_id', $parent->student->id)
                    ->orderBy('created_at', 'desc')
                    ->paginate(15);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'last_page' => $results->lastPage(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'exam_id' => 'required|exists:exams,id',
            'subject_id' => 'required|exists:subjects,id',
            'marks_obtained' => 'required|numeric|min:0',
            'total_marks' => 'required|numeric|min:0',
            'percentage' => 'required|numeric|min:0|max:100',
            'grade' => 'required|string|max:2',
            'remarks' => 'nullable|string',
        ]);

        // Check if result already exists for this student and exam
        $existingResult = Result::where('student_id', $request->student_id)
            ->where('exam_id', $request->exam_id)
            ->where('subject_id', $request->subject_id)
            ->first();

        if ($existingResult) {
            return response()->json([
                'success' => false,
                'message' => 'Result already exists for this student and exam'
            ], 422);
        }

        $result = Result::create($request->all());
        $result->load(['student.user', 'exam', 'subject']);

        return response()->json([
            'success' => true,
            'message' => 'Result created successfully',
            'data' => $result
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        $result = Result::with(['student.user', 'exam', 'subject'])->findOrFail($id);

        // Check if user has permission to view this result
        if ($user->role === 'student' && $result->student_id !== $user->student->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'parent' && $result->student_id !== $user->parentModel->student->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($result);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $result = Result::findOrFail($id);

        $request->validate([
            'marks_obtained' => 'sometimes|required|numeric|min:0',
            'total_marks' => 'sometimes|required|numeric|min:0',
            'percentage' => 'sometimes|required|numeric|min:0|max:100',
            'grade' => 'sometimes|required|string|max:2',
            'remarks' => 'nullable|string',
        ]);

        $result->update($request->all());
        $result->load(['student.user', 'exam', 'subject']);

        return response()->json([
            'success' => true,
            'message' => 'Result updated successfully',
            'data' => $result
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $result = Result::findOrFail($id);
        $result->delete();

        return response()->json([
            'success' => true,
            'message' => 'Result deleted successfully'
        ]);
    }
}
