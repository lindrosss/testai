<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string|null $vin
 * @property int $car_model_id
 * @property int $shipping_origin_id
 * @property int $purchase_price_usd
 * @property string $status
 * @property string|null $notes
 */
class StockCar extends Model
{
    use HasFactory;

    protected $fillable = [
        'vin',
        'car_model_id',
        'shipping_origin_id',
        'purchase_price_usd',
        'status',
        'notes',
    ];

    public function carModel(): BelongsTo
    {
        return $this->belongsTo(CarModel::class);
    }

    public function shippingOrigin(): BelongsTo
    {
        return $this->belongsTo(ShippingOrigin::class);
    }
}

