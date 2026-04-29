<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $code
 * @property string $name
 * @property int $logistics_cost_usd
 * @property int|null $lead_time_days_min
 * @property int|null $lead_time_days_max
 */
class ShippingOrigin extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'logistics_cost_usd',
        'lead_time_days_min',
        'lead_time_days_max',
    ];

    public function stockCars(): HasMany
    {
        return $this->hasMany(StockCar::class);
    }
}

