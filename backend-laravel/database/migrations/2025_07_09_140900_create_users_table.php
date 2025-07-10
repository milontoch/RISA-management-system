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
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password', 255);
            $table->enum('role', ['admin', 'teacher', 'student', 'parent']);
            $table->string('profile_picture', 255)->nullable();
            $table->string('address', 255)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('zip', 10)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('emergency_contact_name', 100)->nullable();
            $table->boolean('is_class_teacher')->default(0);
            $table->unsignedBigInteger('class_teacher_of')->nullable();
            $table->rememberToken();
            $table->timestamps();
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
