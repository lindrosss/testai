<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_logs', function (Blueprint $table): void {
            $table->uuid('id')->primary();

            $table->string('mailer')->nullable();
            $table->string('message_id')->nullable();

            $table->json('from')->nullable();
            $table->json('to')->nullable();
            $table->json('cc')->nullable();
            $table->json('bcc')->nullable();

            $table->string('subject')->nullable();
            $table->longText('html')->nullable();
            $table->longText('text')->nullable();
            $table->longText('headers')->nullable();

            $table->string('status')->default('sending'); // sending|sent|failed
            $table->longText('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_logs');
    }
};

