<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    protected $fillable = ['name', 'is_active'];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if ($model->is_active) {
                $model->deactivateOthers();
            }
        });
        static::updating(function ($model) {
            if ($model->is_active) {
                $model->deactivateOthers();
            }
        });
    }

    public function deactivateOthers()
    {
        self::where('is_active', true)->update(['is_active' => false]);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
