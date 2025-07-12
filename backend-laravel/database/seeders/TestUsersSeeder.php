<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\Student;
use App\Models\ClassModel;
use App\Models\Subject;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@risa.edu',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        // Create Teacher User
        $teacher = User::create([
            'name' => 'John Smith',
            'email' => 'teacher@risa.edu',
            'password' => Hash::make('teacher123'),
            'role' => 'teacher',
            'profile_picture' => null,
            'is_class_teacher' => true,
            'class_teacher_of' => 1, // Assuming class ID 1 exists
        ]);

        // Create Teacher record
        Teacher::create([
            'user_id' => $teacher->id,
            'subject_id' => 1, // Assuming subject ID 1 exists
            'qualification' => 'M.Ed in Mathematics',
            'experience_years' => 5,
            'phone' => '+1234567890',
            'address' => '123 Teacher Street, City',
            'date_of_birth' => '1985-03-15',
            'gender' => 'Male',
            'joining_date' => '2020-01-15',
            'salary' => 50000.00,
            'status' => 'active',
        ]);

        // Create Parent User
        $parent = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'parent@risa.edu',
            'password' => Hash::make('parent123'),
            'role' => 'parent',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        // Create Parent record
        ParentModel::create([
            'user_id' => $parent->id,
            'student_id' => 1, // Assuming student ID 1 exists
            'relationship' => 'Mother',
            'phone' => '+1987654321',
            'address' => '456 Parent Avenue, City',
            'occupation' => 'Engineer',
            'emergency_contact' => '+1555555555',
            'status' => 'active',
        ]);

        // Create additional test users for variety
        $teacher2 = User::create([
            'name' => 'Maria Garcia',
            'email' => 'teacher2@risa.edu',
            'password' => Hash::make('teacher123'),
            'role' => 'teacher',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        Teacher::create([
            'user_id' => $teacher2->id,
            'subject_id' => 2, // Assuming subject ID 2 exists
            'qualification' => 'Ph.D in Science',
            'experience_years' => 8,
            'phone' => '+1122334455',
            'address' => '789 Science Road, City',
            'date_of_birth' => '1980-07-22',
            'gender' => 'Female',
            'joining_date' => '2018-08-01',
            'salary' => 60000.00,
            'status' => 'active',
        ]);

        $parent2 = User::create([
            'name' => 'Michael Brown',
            'email' => 'parent2@risa.edu',
            'password' => Hash::make('parent123'),
            'role' => 'parent',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        ParentModel::create([
            'user_id' => $parent2->id,
            'student_id' => 2, // Assuming student ID 2 exists
            'relationship' => 'Father',
            'phone' => '+1444333222',
            'address' => '321 Family Lane, City',
            'occupation' => 'Doctor',
            'emergency_contact' => '+1666666666',
            'status' => 'active',
        ]);

        $this->command->info('Test users created successfully!');
        $this->command->info('');
        $this->command->info('=== ADMIN LOGIN ===');
        $this->command->info('Email: admin@risa.edu');
        $this->command->info('Password: admin123');
        $this->command->info('');
        $this->command->info('=== TEACHER LOGINS ===');
        $this->command->info('Email: teacher@risa.edu');
        $this->command->info('Password: teacher123');
        $this->command->info('');
        $this->command->info('Email: teacher2@risa.edu');
        $this->command->info('Password: teacher123');
        $this->command->info('');
        $this->command->info('=== PARENT LOGINS ===');
        $this->command->info('Email: parent@risa.edu');
        $this->command->info('Password: parent123');
        $this->command->info('');
        $this->command->info('Email: parent2@risa.edu');
        $this->command->info('Password: parent123');
    }
} 