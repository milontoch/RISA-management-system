<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;
use Illuminate\Support\Facades\Auth;

class AcademicYearController extends Controller
{
    // List all academic years
    public function index()
    {
        $this->authorizeAdmin();
        return response()->json([
            'success' => true,
            'data' => AcademicYear::orderByDesc('is_active')->orderByDesc('id')->get()
        ]);
    }

    // Create a new academic year
    public function store(Request $request)
    {
        $this->authorizeAdmin();
        $request->validate([
            'name' => 'required|string|max:20|unique:academic_years,name',
            'is_active' => 'boolean',
        ]);
        $year = AcademicYear::create([
            'name' => $request->name,
            'is_active' => $request->is_active ?? false,
        ]);
        return response()->json(['success' => true, 'data' => $year], 201);
    }

    // Show a single academic year
    public function show($id)
    {
        $this->authorizeAdmin();
        $year = AcademicYear::findOrFail($id);
        return response()->json(['success' => true, 'data' => $year]);
    }

    // Update an academic year (name or is_active)
    public function update(Request $request, $id)
    {
        $this->authorizeAdmin();
        $year = AcademicYear::findOrFail($id);
        $request->validate([
            'name' => 'sometimes|required|string|max:20|unique:academic_years,name,' . $id,
            'is_active' => 'boolean',
        ]);
        $year->update($request->only(['name', 'is_active']));
        return response()->json(['success' => true, 'data' => $year]);
    }

    // Toggle active status (set this year as active, deactivate others)
    public function toggleActive($id)
    {
        $this->authorizeAdmin();
        $year = AcademicYear::findOrFail($id);
        $year->update(['is_active' => true]);
        return response()->json(['success' => true, 'data' => $year]);
    }

    // Get the current active academic year
    public function getActiveYear()
    {
        $year = AcademicYear::active()->first();
        return response()->json(['success' => true, 'data' => $year]);
    }

    // Helper: Only admin can manage
    protected function authorizeAdmin()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'admin') {
            abort(403, 'Only admin can manage academic years.');
        }
    }
}
