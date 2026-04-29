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
        // Демо-данные должны быть предсказуемыми: убираем бренды, которые не нужны в демонстрации.
        // cascadeOnDelete на stock_cars.car_model_id очистит связанные "позиции".
        CarModel::query()->whereIn('brand', ['BMW', 'Toyota'])->delete();

        $models = [
            // Корейские бренды/модели с разными параметрами, чтобы клиент видел зависимости.
            ['brand' => 'Hyundai', 'model' => 'Tucson', 'engine_power_hp' => 150, 'market_price_usd' => 31000],
            ['brand' => 'Hyundai', 'model' => 'Santa Fe', 'engine_power_hp' => 281, 'market_price_usd' => 42000],
            ['brand' => 'Hyundai', 'model' => 'Elantra', 'engine_power_hp' => 147, 'market_price_usd' => 23000],

            ['brand' => 'Kia', 'model' => 'K5', 'engine_power_hp' => 194, 'market_price_usd' => 33000],
            ['brand' => 'Kia', 'model' => 'Sportage', 'engine_power_hp' => 187, 'market_price_usd' => 32000],
            ['brand' => 'Kia', 'model' => 'Sorento', 'engine_power_hp' => 281, 'market_price_usd' => 44000],

            ['brand' => 'Genesis', 'model' => 'GV70', 'engine_power_hp' => 300, 'market_price_usd' => 56000],
            ['brand' => 'Genesis', 'model' => 'G80', 'engine_power_hp' => 304, 'market_price_usd' => 62000],

            ['brand' => 'KGM', 'model' => 'Torres', 'engine_power_hp' => 163, 'market_price_usd' => 29500],
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
            [
                'code' => 'kr',
                'name' => 'Корея',
                'logistics_cost_usd' => 1600,
                'lead_time_days_min' => 12,
                'lead_time_days_max' => 24,
            ],
        ];

        foreach ($origins as $o) {
            ShippingOrigin::query()->updateOrCreate(
                ['code' => $o['code']],
                $o,
            );
        }

        $tucson = CarModel::query()->where(['brand' => 'Hyundai', 'model' => 'Tucson'])->firstOrFail();
        $santafe = CarModel::query()->where(['brand' => 'Hyundai', 'model' => 'Santa Fe'])->firstOrFail();
        $elantra = CarModel::query()->where(['brand' => 'Hyundai', 'model' => 'Elantra'])->firstOrFail();
        $k5 = CarModel::query()->where(['brand' => 'Kia', 'model' => 'K5'])->firstOrFail();
        $sportage = CarModel::query()->where(['brand' => 'Kia', 'model' => 'Sportage'])->firstOrFail();
        $sorento = CarModel::query()->where(['brand' => 'Kia', 'model' => 'Sorento'])->firstOrFail();
        $gv70 = CarModel::query()->where(['brand' => 'Genesis', 'model' => 'GV70'])->firstOrFail();
        $g80 = CarModel::query()->where(['brand' => 'Genesis', 'model' => 'G80'])->firstOrFail();
        $torres = CarModel::query()->where(['brand' => 'KGM', 'model' => 'Torres'])->firstOrFail();

        $kz = ShippingOrigin::query()->where('code', 'kz')->firstOrFail();
        $cn = ShippingOrigin::query()->where('code', 'cn')->firstOrFail();
        $jp = ShippingOrigin::query()->where('code', 'jp')->firstOrFail();
        $kr = ShippingOrigin::query()->where('code', 'kr')->firstOrFail();

        // Привязка направления доставки к модели (демо‑правило).
        // Клиент видит "откуда везём", но не выбирает вручную.
        // Привязка направления доставки к модели (демо‑правило).
        // Клиент видит "откуда везём", но не выбирает вручную.
        $tucson->update(['shipping_origin_id' => $kr->id]);
        $santafe->update(['shipping_origin_id' => $kr->id]);
        $elantra->update(['shipping_origin_id' => $kr->id]);

        $k5->update(['shipping_origin_id' => $cn->id]);
        $sportage->update(['shipping_origin_id' => $cn->id]);
        $sorento->update(['shipping_origin_id' => $kz->id]);

        $gv70->update(['shipping_origin_id' => $kr->id]);
        $g80->update(['shipping_origin_id' => $jp->id]);

        $torres->update(['shipping_origin_id' => $kz->id]);

        // Для демо "у клиента нет авто на складе": очищаем позиции и не создаём новые.
        StockCar::query()->delete();
    }
}

