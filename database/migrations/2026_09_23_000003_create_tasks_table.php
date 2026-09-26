<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('tasks')) {
            return;
        }

        Schema::create('tasks', function (Blueprint $table) {
            $table->increments('taskID');
            $table->string('taskName');
            $table->text('description')->nullable();
            $table->enum('status', ['Pending', 'Completed'])->default('Pending');
            $table->date('dueDate')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};