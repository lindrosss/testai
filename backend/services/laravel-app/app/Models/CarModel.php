<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $brand
 * @property string $model
 * @property int $engine_power_hp
 * @property int|null $market_price_usd
 * @property int|null $shipping_origin_id
 */
class CarModel extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'engine_power_hp',
        'market_price_usd',
        'shipping_origin_id',
    ];

    public function shippingOrigin(): BelongsTo
    {
        return $this->belongsTo(ShippingOrigin::class);
    }

    public function stockCars(): HasMany
    {
        return $this->hasMany(StockCar::class);
    }
}

