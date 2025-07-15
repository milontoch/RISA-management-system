<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Student;
use App\Models\User;
use App\Models\ClassModel;
use App\Models\Section;
use App\Models\Result;
use App\Models\Attendance;
use Illuminate\Support\Carbon;

class StudentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $students = Student::with(['user', 'classModel', 'section'])
            ->when($request->class_id, function ($query, $classId) {
                return $query->where('class_id', $classId);
            })
            ->when($request->section_id, function ($query, $sectionId) {
                return $query->where('section_id', $sectionId);
            })
            ->when($request->search, function ($query, $search) {
                return $query->whereHas('user', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $students->items(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
                'last_page' => $students->lastPage(),
            ]
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
            'class_id' => 'nullable|exists:classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'roll_number' => 'nullable|string|max:20',
        ]);

        // Create user first
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => 'student',
        ]);

        // Create student record
        $student = Student::create([
            'user_id' => $user->id,
            'class_id' => $request->class_id,
            'section_id' => $request->section_id,
            'roll_number' => $request->roll_number,
        ]);

        $student->load(['user', 'classModel', 'section']);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully',
            'data' => $student
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $student = Student::with(['user', 'classModel', 'section', 'attendance', 'results', 'fees'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $student = Student::findOrFail($id);

        $request->validate([
            'name' => 'sometimes|string|max:100',
            'email' => 'sometimes|email|unique:users,email,' . $student->user_id,
            'class_id' => 'nullable|exists:classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'roll_number' => 'nullable|string|max:20',
        ]);

        // Update user data
        if ($request->has('name') || $request->has('email')) {
            $student->user->update($request->only(['name', 'email']));
        }

        // Update student data
        $student->update($request->only(['class_id', 'section_id', 'roll_number']));

        $student->load(['user', 'classModel', 'section']);

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $student
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $student = Student::findOrFail($id);
        
        // Delete associated user (this will cascade delete student record)
        $student->user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully'
        ]);
    }

    /**
     * Promote students based on average score for the academic year.
     */
    public function promoteStudents(Request $request)
    {
        $year = $request->input('academic_year');
        $nextYear = $year ? ((int)$year + 1) : null;
        $students = Student::with(['results', 'classModel'])->get();
        $promoted = 0;
        foreach ($students as $student) {
            $results = $student->results()->where('academic_year', $year)->get();
            if ($results->count() === 0) continue;
            $avg = $results->avg(function($r) { return $r->marks_obtained / max($r->total_marks, 1) * 100; });
            if ($avg >= 60) {
                // Find next class (by id increment, or custom logic)
                $nextClass = ClassModel::where('id', '>', $student->class_id)->orderBy('id')->first();
                if ($nextClass) {
                    $student->class_id = $nextClass->id;
                    $student->academic_year = $nextYear;
                    $student->save();
                    $promoted++;
                }
            } else {
                $student->academic_year = $nextYear;
                $student->save();
            }
        }
        return response()->json(['success' => true, 'message' => "Promotion complete", 'promoted' => $promoted]);
    }

    /**
     * Mark students as inactive if no attendance in last 30 days.
     */
    public function checkInactivity(Request $request)
    {
        $now = Carbon::now();
        $students = Student::all();
        $inactive = 0;
        foreach ($students as $student) {
            $lastAttendance = Attendance::where('student_id', $student->id)->orderBy('date', 'desc')->first();
            if (!$lastAttendance || Carbon::parse($lastAttendance->date)->diffInDays($now) > 30) {
                if ($student->status !== 'inactive') {
                    $student->status = 'inactive';
                    $student->save();
                    $inactive++;
                }
            } else {
                if ($student->status !== 'active') {
                    $student->status = 'active';
                    $student->save();
                }
            }
        }
        return response()->json(['success' => true, 'message' => "Inactivity check complete", 'inactive' => $inactive]);
    }
}
