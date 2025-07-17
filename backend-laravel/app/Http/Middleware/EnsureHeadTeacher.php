<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureHeadTeacher
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'teacher' || !$user->is_head_teacher) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }
        return $next($request);
    }
} 