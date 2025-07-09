<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    public function teachers()
    {
        return $this->hasMany(Teacher::class, 'subject_id');
    }
    public function results()
    {
        return $this->hasMany(Result::class, 'subject_id');
    }
    public function documents()
    {
        return $this->hasMany(Document::class, 'subject_id');
    }
    public function timetables()
    {
        return $this->hasMany(Timetable::class, 'subject_id');
    }
}
