<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrow_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrow_ticket_id')->constrained()->onDelete('cascade');
            $table->foreignId('book_copy_id')->constrained();
            $table->date('due_date')->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->decimal('late_fee', 12, 2)->default(0);
            $table->enum('status', ['borrowed', 'returned', 'lost'])->default('borrowed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrow_items');
    }
};
