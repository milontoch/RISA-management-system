<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profile_picture',
        'is_class_teacher',
        'class_teacher_of',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Valid user roles
     */
    public const ROLE_ADMIN = 'admin';
    public const ROLE_TEACHER = 'teacher';
    // No student/parent as user roles

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role === self::ROLE_ADMIN;
    }

    /**
     * Check if user is teacher
     */
    public function isTeacher()
    {
        return $this->role === self::ROLE_TEACHER;
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }
    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }
    public function parentModel()
    {
        return $this->hasOne(ParentModel::class);
    }
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }
    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }
    public function auditLogs()
    {
        return $this->hasMany(AuditLog::class);
    }
    public function documents()
    {
        return $this->hasMany(Document::class);
    }
    public function userSettings()
    {
        return $this->hasMany(UserSetting::class);
    }
    // Add classes relationship for teachers
    public function classes()
    {
        return $this->hasMany(ClassModel::class, 'teacher_id');
    }

    public function headedClasses()
    {
        return $this->hasMany(ClassModel::class, 'head_teacher_id');
    }
}
