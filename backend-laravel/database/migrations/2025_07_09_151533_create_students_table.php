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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('class_id')->nullable();
            $table->unsignedBigInteger('section_id')->nullable();
            $table->string('admission_number', 50)->unique();
            $table->string('roll_number', 20)->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->string('blood_group')->nullable();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact')->nullable();
            $table->date('admission_date')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('class_id')->references('id')->on('classes')->onDelete('set null');
            $table->foreign('section_id')->references('id')->on('sections')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
