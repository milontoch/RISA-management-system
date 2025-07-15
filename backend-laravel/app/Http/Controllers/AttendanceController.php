<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\ClassModel;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'teacher' && $request->has('class_id')) {
            $class = ClassModel::find($request->class_id);
            if (!$class || $class->head_teacher_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
        }
        $attendance = Attendance::with(['student.user', 'student.classModel', 'student.section'])
            ->when($request->student_id, function ($query, $studentId) {
                return $query->where('student_id', $studentId);
            })
            ->when($request->date, function ($query, $date) {
                return $query->where('date', $date);
            })
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->class_id, function ($query, $classId) {
                return $query->whereHas('student', function ($q) use ($classId) {
                    $q->where('class_id', $classId);
                });
            })
            ->orderBy('date', 'desc')
            ->paginate(15);

        return response()->json($attendance);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $student = Student::find($request->student_id);
        if ($user->role === 'teacher' && $student) {
            $class = $student->classModel;
            if (!$class || $class->head_teacher_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
        }
        $request->validate([
            'student_id' => 'required|exists:students,id',
            'date' => 'required|date',
            'status' => 'required|in:present,absent,late',
        ]);

        // Check if attendance already exists for this student on this date
        $existingAttendance = Attendance::where('student_id', $request->student_id)
            ->where('date', $request->date)
            ->first();

        if ($existingAttendance) {
            return response()->json([
                'success' => false,
                'message' => 'Attendance already marked for this student on this date'
            ], 422);
        }

        $attendance = Attendance::create($request->all());
        $attendance->load(['student.user', 'student.classModel']);

        return response()->json([
            'success' => true,
            'message' => 'Attendance marked successfully',
            'data' => $attendance
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $attendance = Attendance::with(['student.user', 'student.classModel', 'student.section'])
            ->findOrFail($id);

        return response()->json($attendance);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $attendance = Attendance::findOrFail($id);

        $request->validate([
            'status' => 'required|in:present,absent,late',
        ]);

        $attendance->update($request->only(['status']));
        $attendance->load(['student.user', 'student.classModel']);

        return response()->json([
            'success' => true,
            'message' => 'Attendance updated successfully',
            'data' => $attendance
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attendance record deleted successfully'
        ]);
    }

    /**
     * Mark bulk attendance for a class
     */
    public function markBulkAttendance(Request $request)
    {
        $user = Auth::user();
        $class = ClassModel::find($request->class_id);
        if ($user->role === 'teacher' && (!$class || $class->head_teacher_id !== $user->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
            'attendance_data' => 'required|array',
            'attendance_data.*.student_id' => 'required|exists:students,id',
            'attendance_data.*.status' => 'required|in:present,absent,late',
        ]);

        DB::beginTransaction();
        try {
            foreach ($request->attendance_data as $data) {
                // Check if attendance already exists
                $existingAttendance = Attendance::where('student_id', $data['student_id'])
                    ->where('date', $request->date)
                    ->first();

                if ($existingAttendance) {
                    // Update existing attendance
                    $existingAttendance->update(['status' => $data['status']]);
                } else {
                    // Create new attendance
                    Attendance::create([
                        'student_id' => $data['student_id'],
                        'date' => $request->date,
                        'status' => $data['status'],
                    ]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Bulk attendance marked successfully'
            ]);
        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark bulk attendance'
            ], 500);
        }
    }

    /**
     * Get students for attendance marking
     */
    public function getStudentsForAttendance(Request $request)
    {
        $user = Auth::user();
        $class = ClassModel::find($request->class_id);
        if ($user->role === 'teacher' && (!$class || $class->head_teacher_id !== $user->id)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }
        $request->validate([
            'class_id' => 'required|exists:classes,id',
            'date' => 'required|date',
        ]);

        $students = Student::with(['user', 'classModel', 'section'])
            ->where('class_id', $request->class_id)
            ->get()
            ->map(function ($student) use ($request) {
                $attendance = Attendance::where('student_id', $student->id)
                    ->where('date', $request->date)
                    ->first();

                $student->today_attendance = $attendance ? $attendance->status : null;
                return $student;
            });

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    /**
     * Generate attendance report
     */
    public function generateReport(Request $request)
    {
        $user = Auth::user();
        if ($user->role === 'teacher' && $request->has('class_id')) {
            $class = ClassModel::find($request->class_id);
            if (!$class || $class->head_teacher_id !== $user->id) {
                return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
            }
        }
        $request->validate([
            'student_id' => 'nullable|exists:students,id',
            'class_id' => 'nullable|exists:classes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $query = Attendance::with(['student.user', 'student.classModel'])
            ->whereBetween('date', [$request->start_date, $request->end_date]);

        if ($request->student_id) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->class_id) {
            $query->whereHas('student', function ($q) use ($request) {
                $q->where('class_id', $request->class_id);
            });
        }

        $attendance = $query->get();

        // Calculate statistics
        $totalDays = $attendance->count();
        $presentDays = $attendance->where('status', 'present')->count();
        $absentDays = $attendance->where('status', 'absent')->count();
        $lateDays = $attendance->where('status', 'late')->count();

        $attendancePercentage = $totalDays > 0 ? (($presentDays + $lateDays) / $totalDays) * 100 : 0;

        $report = [
            'attendance_records' => $attendance,
            'statistics' => [
                'total_days' => $totalDays,
                'present_days' => $presentDays,
                'absent_days' => $absentDays,
                'late_days' => $lateDays,
                'attendance_percentage' => round($attendancePercentage, 2),
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $report
        ]);
    }
}
