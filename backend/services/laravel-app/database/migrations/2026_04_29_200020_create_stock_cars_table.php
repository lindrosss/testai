<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_cars', function (Blueprint $table) {
            $table->id();
            $table->string('vin')->nullable();
            $table->foreignId('car_model_id')->constrained('car_models')->cascadeOnDelete();
            $table->foreignId('shipping_origin_id')->constrained('shipping_origins')->restrictOnDelete();
            $table->unsignedInteger('purchase_price_usd');
            $table->string('status')->default('in_stock'); // in_stock | reserved | sold
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_cars');
    }
};

