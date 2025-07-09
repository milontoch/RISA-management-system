<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('password', 255);
            $table->enum('role', ['admin', 'teacher', 'student', 'parent']);
            $table->string('profile_picture', 255)->nullable();
            $table->boolean('is_class_teacher')->default(0);
            $table->unsignedBigInteger('class_teacher_of')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->foreign('class_teacher_of')->references('id')->on('classes')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
