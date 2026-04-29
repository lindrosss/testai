<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('callback_requests', function (Blueprint $table) {
            $table->json('meta')->nullable()->after('message');
        });
    }

    public function down(): void
    {
        Schema::table('callback_requests', function (Blueprint $table) {
            $table->dropColumn('meta');
        });
    }
};
