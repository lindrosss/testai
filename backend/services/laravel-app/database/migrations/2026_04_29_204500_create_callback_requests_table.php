<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('callback_requests', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('phone', 32);
            $table->string('topic')->default('callback');
            $table->text('message')->nullable();
            $table->string('status')->default('new'); // new | in_progress | success | failed
            $table->timestamps();

            $table->index(['status']);
            $table->index(['phone']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('callback_requests');
    }
};

