<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@risa.edu',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'profile_picture' => null,
            'is_class_teacher' => false,
            'class_teacher_of' => null,
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@risa.edu');
        $this->command->info('Password: admin123');
    }
} 