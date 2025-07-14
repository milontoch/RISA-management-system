<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Notification;
use App\Models\Message;

class NotificationMessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users
        $admin = User::where('email', 'admin@risa.edu')->first();
        $teacher1 = User::where('email', 'teacher@risa.edu')->first();
        $teacher2 = User::where('email', 'teacher2@risa.edu')->first();
        $student1 = User::where('email', 'student1@risa.edu')->first();
        $student2 = User::where('email', 'student2@risa.edu')->first();
        $parent1 = User::where('email', 'parent@risa.edu')->first();
        $parent2 = User::where('email', 'parent2@risa.edu')->first();

        if (!$admin || !$teacher1 || !$student1 || !$parent1) {
            $this->command->error('Required users not found. Please run the CompleteTestDataSeeder first.');
            return;
        }

        // Create sample notifications
        Notification::create([
            'user_id' => $admin->id,
            'title' => 'Welcome to RISA',
            'message' => 'Welcome to the RISA Management System!',
            'type' => 'announcement',
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $teacher1->id,
            'title' => 'Class Schedule Update',
            'message' => 'Your class schedule has been updated for next week.',
            'type' => 'reminder',
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $student1->id,
            'title' => 'New Assignment',
            'message' => 'A new assignment has been posted for Mathematics.',
            'type' => 'message',
            'read_at' => null,
        ]);

        Notification::create([
            'user_id' => $parent1->id,
            'title' => 'Parent Meeting',
            'message' => 'Parent-teacher meeting scheduled for next Friday.',
            'type' => 'reminder',
            'read_at' => null,
        ]);

        // Create sample messages
        Message::create([
            'sender_id' => $admin->id,
            'receiver_id' => $teacher1->id,
            'message' => 'Please submit your weekly report by Friday.',
        ]);

        Message::create([
            'sender_id' => $teacher1->id,
            'receiver_id' => $student1->id,
            'message' => 'Great work on your last assignment!',
        ]);

        Message::create([
            'sender_id' => $parent1->id,
            'receiver_id' => $teacher1->id,
            'message' => 'Could you please provide an update on Alex\'s progress?',
        ]);

        Message::create([
            'sender_id' => $teacher1->id,
            'receiver_id' => $parent1->id,
            'message' => 'Alex is doing very well in Mathematics. Keep up the good work!',
        ]);

        // Get existing models for relationships
        $class1 = \App\Models\ClassModel::where('name', 'Class 1')->first();
        $class2 = \App\Models\ClassModel::where('name', 'Class 2')->first();
        $mathSubject = \App\Models\Subject::where('name', 'Mathematics')->first();
        $scienceSubject = \App\Models\Subject::where('name', 'Science')->first();

        if ($class1 && $class2 && $mathSubject && $scienceSubject) {
            // Create sample exams
            $exam1 = \App\Models\Exam::create([
                'name' => 'Mid Term Mathematics',
                'class_id' => $class1->id,
                'date' => now()->addDays(7)->toDateString(),
            ]);

            $exam2 = \App\Models\Exam::create([
                'name' => 'Science Quiz',
                'class_id' => $class2->id,
                'date' => now()->addDays(10)->toDateString(),
            ]);

            // Create sample results
            \App\Models\Result::create([
                'student_id' => $student1->id,
                'exam_id' => $exam1->id,
                'subject_id' => $mathSubject->id,
                'marks_obtained' => 85,
                'total_marks' => 100,
            ]);

            \App\Models\Result::create([
                'student_id' => $student2->id,
                'exam_id' => $exam2->id,
                'subject_id' => $scienceSubject->id,
                'marks_obtained' => 42,
                'total_marks' => 50,
            ]);

            // Create sample fees
            \App\Models\Fee::create([
                'student_id' => $student1->id,
                'amount' => 5000.00,
                'due_date' => now()->addDays(15),
                'status' => 'unpaid',
            ]);

            \App\Models\Fee::create([
                'student_id' => $student2->id,
                'amount' => 500.00,
                'due_date' => now()->addDays(10),
                'status' => 'paid',
            ]);

            $this->command->info('Notifications, messages, exams, results, and fees created successfully!');
        } else {
            $this->command->info('Notifications and messages created successfully!');
        }
    }
} 