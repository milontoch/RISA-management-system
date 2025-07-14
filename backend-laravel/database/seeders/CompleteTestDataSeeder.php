<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Teacher;
use App\Models\ParentModel;
use App\Models\Student;
use App\Models\ClassModel;
use App\Models\Subject;
use App\Models\Section;
use Illuminate\Support\Facades\Hash;

class CompleteTestDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Sections
        $sectionA = Section::create([
            'name' => 'Section A',
            'description' => 'Morning Section',
            'capacity' => 30,
            'status' => 'active',
        ]);

        $sectionB = Section::create([
            'name' => 'Section B',
            'description' => 'Afternoon Section',
            'capacity' => 30,
            'status' => 'active',
        ]);

        // Create Classes
        $class1 = ClassModel::create([
            'name' => 'Class 1',
            'section_id' => $sectionA->id,
            'academic_year' => '2024-2025',
            'capacity' => 30,
            'status' => 'active',
        ]);

        $class2 = ClassModel::create([
            'name' => 'Class 2',
            'section_id' => $sectionB->id,
            'academic_year' => '2024-2025',
            'capacity' => 30,
            'status' => 'active',
        ]);

        // Create Subjects
        $mathSubject = Subject::create([
            'name' => 'Mathematics',
            'code' => 'MATH101',
            'description' => 'Basic Mathematics',
            'credits' => 4,
            'status' => 'active',
        ]);

        $scienceSubject = Subject::create([
            'name' => 'Science',
            'code' => 'SCI101',
            'description' => 'General Science',
            'credits' => 4,
            'status' => 'active',
        ]);

        $englishSubject = Subject::create([
            'name' => 'English',
            'code' => 'ENG101',
            'description' => 'English Language',
            'credits' => 3,
            'status' => 'active',
        ]);

        // Create Students
        $student1 = Student::create([
            'user_id' => null, // Will be updated after user creation
            'class_id' => $class1->id,
            'admission_number' => 'STU001',
            'roll_number' => '001',
            'date_of_birth' => '2010-05-15',
            'gender' => 'Male',
            'blood_group' => 'A+',
            'phone' => '+1111111111',
            'address' => '123 Student Street, City',
            'emergency_contact' => '+1222222222',
            'admission_date' => '2024-01-15',
            'status' => 'active',
        ]);

        $student2 = Student::create([
            'user_id' => null, // Will be updated after user creation
            'class_id' => $class2->id,
            'admission_number' => 'STU002',
            'roll_number' => '002',
            'date_of_birth' => '2010-08-20',
            'gender' => 'Female',
            'blood_group' => 'B+',
            'phone' => '+1333333333',
            'address' => '456 Student Avenue, City',
            'emergency_contact' => '+1444444444',
            'admission_date' => '2024-01-15',
            'status' => 'active',
        ]);

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

        // Create Teacher Users
        $teacher1 = User::create([
            'name' => 'John Smith',
            'email' => 'teacher@risa.edu',
            'password' => Hash::make('teacher123'),
            'role' => 'teacher',
            'profile_picture' => null,
            'is_class_teacher' => true,
            'class_teacher_of' => $class1->id,
        ]);

        $teacher2 = User::create([
            'name' => 'Maria Garcia',
            'email' => 'teacher2@risa.edu',
            'password' => Hash::make('teacher123'),
            'role' => 'teacher',
            'profile_picture' => null,
            'is_class_teacher' => true,
            'class_teacher_of' => $class2->id,
        ]);

        // Create Teacher records
        Teacher::create([
            'user_id' => $teacher1->id,
            'subject_id' => $mathSubject->id,
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

        Teacher::create([
            'user_id' => $teacher2->id,
            'subject_id' => $scienceSubject->id,
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

        // Create Student Users
        $studentUser1 = User::create([
            'name' => 'Alex Johnson',
            'email' => 'student1@risa.edu',
            'password' => Hash::make('student123'),
            'role' => 'student',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        $studentUser2 = User::create([
            'name' => 'Emma Wilson',
            'email' => 'student2@risa.edu',
            'password' => Hash::make('student123'),
            'role' => 'student',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        // Update students with user IDs
        $student1->update(['user_id' => $studentUser1->id]);
        $student2->update(['user_id' => $studentUser2->id]);

        // Create Parent Users
        $parent1 = User::create([
            'name' => 'Sarah Johnson',
            'email' => 'parent@risa.edu',
            'password' => Hash::make('parent123'),
            'role' => 'parent',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
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

        // Create Parent records
        ParentModel::create([
            'user_id' => $parent1->id,
            'student_id' => $student1->id,
            'relationship' => 'Mother',
            'phone' => '+1987654321',
            'address' => '456 Parent Avenue, City',
            'occupation' => 'Engineer',
            'emergency_contact' => '+1555555555',
            'status' => 'active',
        ]);

        ParentModel::create([
            'user_id' => $parent2->id,
            'student_id' => $student2->id,
            'relationship' => 'Father',
            'phone' => '+1444333222',
            'address' => '321 Family Lane, City',
            'occupation' => 'Doctor',
            'emergency_contact' => '+1666666666',
            'status' => 'active',
        ]);

        // Create sample notifications
        \App\Models\Notification::create([
            'user_id' => $admin->id,
            'title' => 'Welcome to RISA',
            'message' => 'Welcome to the RISA Management System!',
            'type' => 'announcement',
            'read_at' => null,
        ]);

        \App\Models\Notification::create([
            'user_id' => $teacher1->id,
            'title' => 'Class Schedule Update',
            'message' => 'Your class schedule has been updated for next week.',
            'type' => 'reminder',
            'read_at' => null,
        ]);

        \App\Models\Notification::create([
            'user_id' => $studentUser1->id,
            'title' => 'New Assignment',
            'message' => 'A new assignment has been posted for Mathematics.',
            'type' => 'message',
            'read_at' => null,
        ]);

        // Create sample messages
        \App\Models\Message::create([
            'sender_id' => $admin->id,
            'receiver_id' => $teacher1->id,
            'message' => 'Please submit your weekly report by Friday.',
        ]);

        \App\Models\Message::create([
            'sender_id' => $teacher1->id,
            'receiver_id' => $studentUser1->id,
            'message' => 'Great work on your last assignment!',
        ]);

        \App\Models\Message::create([
            'sender_id' => $parent1->id,
            'receiver_id' => $teacher1->id,
            'message' => 'Could you please provide an update on Alex\'s progress?',
        ]);

        $this->command->info('Complete test data created successfully!');
        $this->command->info('');
        $this->command->info('=== LOGIN CREDENTIALS ===');
        $this->command->info('');
        $this->command->info('ADMIN:');
        $this->command->info('Email: admin@risa.edu');
        $this->command->info('Password: admin123');
        $this->command->info('');
        $this->command->info('TEACHERS:');
        $this->command->info('Email: teacher@risa.edu (Math Teacher - Class 1)');
        $this->command->info('Email: teacher2@risa.edu (Science Teacher - Class 2)');
        $this->command->info('Password: teacher123');
        $this->command->info('');
        $this->command->info('PARENTS:');
        $this->command->info('Email: parent@risa.edu (Parent of Alex Johnson)');
        $this->command->info('Email: parent2@risa.edu (Parent of Emma Wilson)');
        $this->command->info('Password: parent123');
        $this->command->info('');
        $this->command->info('STUDENTS:');
        $this->command->info('Email: student1@risa.edu (Alex Johnson - Class 1)');
        $this->command->info('Email: student2@risa.edu (Emma Wilson - Class 2)');
        $this->command->info('Password: student123');
        $this->command->info('');
        $this->command->info('=== TEST DATA SUMMARY ===');
        $this->command->info('Classes: 2 (Class 1, Class 2)');
        $this->command->info('Subjects: 3 (Math, Science, English)');
        $this->command->info('Students: 2 (Alex, Emma)');
        $this->command->info('Teachers: 2 (John Smith, Maria Garcia)');
        $this->command->info('Parents: 2 (Sarah Johnson, Michael Brown)');
    }
} 