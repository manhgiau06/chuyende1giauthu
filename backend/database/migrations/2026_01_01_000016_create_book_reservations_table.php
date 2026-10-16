<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->onDelete('cascade');
            $table->foreignId('reader_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'notified', 'fulfilled', 'cancelled', 'expired'])->default('pending');
            $table->integer('priority_number')->default(1);
            $table->timestamp('reserved_at')->useCurrent();
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_reservations');
    }
};
