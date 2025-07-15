<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClassModel extends Model
{
    protected $table = 'classes';
    public function sections()
    {
        return $this->hasMany(Section::class, 'class_id');
    }
    public function students()
    {
        return $this->hasMany(Student::class, 'class_id');
    }
    public function exams()
    {
        return $this->hasMany(Exam::class, 'class_id');
    }
    public function documents()
    {
        return $this->hasMany(Document::class, 'class_id');
    }
    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'class_id');
    }
    public function headTeacher()
    {
        return $this->belongsTo(User::class, 'head_teacher_id');
    }
}
