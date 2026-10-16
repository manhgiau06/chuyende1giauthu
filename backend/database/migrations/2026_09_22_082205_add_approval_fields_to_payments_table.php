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
        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('approved_by')->nullable()->after('reader_id')->constrained('users')->nullOnDelete();
            $table->timestamp('transfer_confirmed_at')->nullable()->after('paid_at');
            $table->timestamp('approved_at')->nullable()->after('transfer_confirmed_at');
            $table->text('note')->nullable()->after('approved_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropForeign(['approved_by']);
            $table->dropColumn(['approved_by', 'transfer_confirmed_at', 'approved_at', 'note']);
        });
    }
};
