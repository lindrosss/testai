<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_origins', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // kz, cn, jp, ...
            $table->string('name');
            $table->unsignedInteger('logistics_cost_usd');
            $table->unsignedSmallInteger('lead_time_days_min')->nullable();
            $table->unsignedSmallInteger('lead_time_days_max')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_origins');
    }
};

