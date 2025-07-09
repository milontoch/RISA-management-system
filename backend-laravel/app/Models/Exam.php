<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    public function classModel()
    {
        return $this->belongsTo(ClassModel::class, 'class_id');
    }
    public function results()
    {
        return $this->hasMany(Result::class, 'exam_id');
    }
}
