<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Fee;
use App\Models\Student;
use Illuminate\Support\Facades\Auth;

class FeeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $fees = [];

        if ($user->role === 'admin') {
            $fees = Fee::with(['student.user', 'student.classModel'])
                ->when($request->student_id, function ($query, $studentId) {
                    return $query->where('student_id', $studentId);
                })
                ->when($request->class_id, function ($query, $classId) {
                    return $query->whereHas('student', function ($q) use ($classId) {
                        $q->where('class_id', $classId);
                    });
                })
                ->when($request->status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->orderBy('due_date', 'desc')
                ->paginate(15);
        } elseif ($user->role === 'student') {
            // Students can see their own fees
            $student = $user->student;
            if ($student) {
                $fees = Fee::where('student_id', $student->id)
                    ->orderBy('due_date', 'desc')
                    ->paginate(15);
            }
        } elseif ($user->role === 'parent') {
            // Parents can see their children's fees
            $parent = $user->parentModel;
            if ($parent && $parent->student) {
                $fees = Fee::where('student_id', $parent->student->id)
                    ->orderBy('due_date', 'desc')
                    ->paginate(15);
            }
        }

        return response()->json($fees);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'fee_type' => 'required|string|max:100',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
            'description' => 'nullable|string',
            'status' => 'required|in:paid,unpaid,partial',
        ]);

        $fee = Fee::create($request->all());
        $fee->load(['student.user', 'student.classModel']);

        return response()->json([
            'success' => true,
            'message' => 'Fee record created successfully',
            'data' => $fee
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $user = Auth::user();
        $fee = Fee::with(['student.user', 'student.classModel'])->findOrFail($id);

        // Check if user has permission to view this fee
        if ($user->role === 'student' && $fee->student_id !== $user->student->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($user->role === 'parent' && $fee->student_id !== $user->parentModel->student->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($fee);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $fee = Fee::findOrFail($id);

        $request->validate([
            'fee_type' => 'sometimes|required|string|max:100',
            'amount' => 'sometimes|required|numeric|min:0',
            'due_date' => 'sometimes|required|date',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|in:paid,unpaid,partial',
            'paid_amount' => 'nullable|numeric|min:0',
            'paid_date' => 'nullable|date',
        ]);

        $fee->update($request->all());
        $fee->load(['student.user', 'student.classModel']);

        return response()->json([
            'success' => true,
            'message' => 'Fee record updated successfully',
            'data' => $fee
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $fee = Fee::findOrFail($id);
        $fee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fee record deleted successfully'
        ]);
    }
}
