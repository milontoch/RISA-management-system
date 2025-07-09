<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function classModel()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }
    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }
    public function results()
    {
        return $this->hasMany(Result::class);
    }
    public function fees()
    {
        return $this->hasMany(Fee::class);
    }
    public function parents()
    {
        return $this->hasMany(ParentModel::class, 'student_id');
    }
}
