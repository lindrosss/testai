<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('car_models', function (Blueprint $table) {
            $table->foreignId('shipping_origin_id')
                ->nullable()
                ->after('market_price_usd')
                ->constrained('shipping_origins')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('car_models', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shipping_origin_id');
        });
    }
};

