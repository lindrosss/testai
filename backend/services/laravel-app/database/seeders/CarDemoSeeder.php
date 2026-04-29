<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\CarModel;
use App\Models\ShippingOrigin;
use App\Models\StockCar;
use Illuminate\Database\Seeder;

class CarDemoSeeder extends Seeder
{
    public function run(): void
    {
        $models = [
            ['brand' => 'Toyota', 'model' => 'Camry', 'engine_power_hp' => 181, 'market_price_usd' => 26000],
            ['brand' => 'BMW', 'model' => 'X5', 'engine_power_hp' => 340, 'market_price_usd' => 78000],
            ['brand' => 'Hyundai', 'model' => 'Tucson', 'engine_power_hp' => 150, 'market_price_usd' => 31000],
            ['brand' => 'Kia', 'model' => 'K5', 'engine_power_hp' => 194, 'market_price_usd' => 33000],
        ];

        foreach ($models as $m) {
            CarModel::query()->updateOrCreate(
                ['brand' => $m['brand'], 'model' => $m['model']],
                $m,
            );
        }

        $origins = [
            [
                'code' => 'kz',
                'name' => 'Казахстан',
                'logistics_cost_usd' => 1200,
                'lead_time_days_min' => 7,
                'lead_time_days_max' => 14,
            ],
            [
                'code' => 'cn',
                'name' => 'Китай',
                'logistics_cost_usd' => 1800,
                'lead_time_days_min' => 14,
                'lead_time_days_max' => 30,
            ],
            [
                'code' => 'jp',
                'name' => 'Япония',
                'logistics_cost_usd' => 2400,
                'lead_time_days_min' => 21,
                'lead_time_days_max' => 45,
            ],
        ];

        foreach ($origins as $o) {
            ShippingOrigin::query()->updateOrCreate(
                ['code' => $o['code']],
                $o,
            );
        }

        $camry = CarModel::query()->where(['brand' => 'Toyota', 'model' => 'Camry'])->firstOrFail();
        $x5 = CarModel::query()->where(['brand' => 'BMW', 'model' => 'X5'])->firstOrFail();
        $tucson = CarModel::query()->where(['brand' => 'Hyundai', 'model' => 'Tucson'])->firstOrFail();

        $kz = ShippingOrigin::query()->where('code', 'kz')->firstOrFail();
        $cn = ShippingOrigin::query()->where('code', 'cn')->firstOrFail();
        $jp = ShippingOrigin::query()->where('code', 'jp')->firstOrFail();

        // Привязка направления доставки к модели (демо‑правило).
        // Клиент видит "откуда везём", но не выбирает вручную.
        $camry->update(['shipping_origin_id' => $kz->id]);
        $x5->update(['shipping_origin_id' => $jp->id]);
        $tucson->update(['shipping_origin_id' => $cn->id]);
        CarModel::query()->where(['brand' => 'Kia', 'model' => 'K5'])->update(['shipping_origin_id' => $cn->id]);

        StockCar::query()->updateOrCreate(
            ['vin' => 'JTNB11HK0K1234567'],
            [
                'car_model_id' => $camry->id,
                'shipping_origin_id' => $kz->id,
                'purchase_price_usd' => 23500,
                'status' => 'in_stock',
                'notes' => 'Демо‑позиция: популярная модель, быстрые сроки.',
            ],
        );
        StockCar::query()->updateOrCreate(
            ['vin' => 'WBAXH5C59DD765432'],
            [
                'car_model_id' => $x5->id,
                'shipping_origin_id' => $jp->id,
                'purchase_price_usd' => 69000,
                'status' => 'reserved',
                'notes' => 'Демо‑позиция: мощный двигатель → высокий утильсбор.',
            ],
        );
        StockCar::query()->updateOrCreate(
            ['vin' => 'KM8J3CA46NU112233'],
            [
                'car_model_id' => $tucson->id,
                'shipping_origin_id' => $cn->id,
                'purchase_price_usd' => 28500,
                'status' => 'sold',
                'notes' => 'Демо‑позиция: уже продано.',
            ],
        );
    }
}

