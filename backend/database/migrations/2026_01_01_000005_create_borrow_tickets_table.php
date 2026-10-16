<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrow_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reader_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('librarian_id')->nullable()->constrained('users')->onDelete('set null');
            $table->enum('status', ['pending', 'approved', 'borrowed', 'returned', 'overdue', 'cancelled'])->default('pending');
            $table->date('borrow_date')->nullable();
            $table->date('due_date')->nullable();
            $table->date('returned_date')->nullable();
            $table->integer('renewed_count')->default(0);
            $table->decimal('total_late_fee', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_tickets');
    }
};
