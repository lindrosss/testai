<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CarModel;
use App\Models\ShippingOrigin;

class AutoCostCalculator
{
    /**
     * @return array{
     *   input: array<string, mixed>,
     *   breakdown: array<string, array{title: string, amount_usd: int, details?: array<string, mixed>}>,
     *   total_usd: int
     * }
     */
    public function calculate(CarModel $carModel, ShippingOrigin $origin, int $budgetUsd): array
    {
        $purchase = max(1, $budgetUsd);

        // 1) Таможенная пошлина (условная модель для демо)
        $dutyRate = $this->dutyRate($carModel->brand, $carModel->engine_power_hp);
        $customsDuty = (int) round($purchase * $dutyRate);

        // 2) Утильсбор зависит от мощности (ступени)
        [$recyclingBase, $recyclingPerHp] = $this->recyclingParams($carModel->engine_power_hp);
        $recyclingFee = (int) round($recyclingBase + ($carModel->engine_power_hp * $recyclingPerHp));

        // 3) Логистика зависит от направления + небольшая поправка на премиум‑бренд
        $brandFactor = $this->brandLogisticsFactor($carModel->brand);
        $logistics = (int) round($origin->logistics_cost_usd * $brandFactor);

        // 4) Комиссия сервиса (min фикс + процент)
        $commissionRate = 0.05;
        $commissionMin = 700;
        $commission = max($commissionMin, (int) round($purchase * $commissionRate));

        $total = $purchase + $customsDuty + $recyclingFee + $logistics + $commission;

        return [
            'input' => [
                'car_model' => [
                    'id' => $carModel->id,
                    'brand' => $carModel->brand,
                    'model' => $carModel->model,
                    'engine_power_hp' => $carModel->engine_power_hp,
                ],
                'origin' => [
                    'id' => $origin->id,
                    'code' => $origin->code,
                    'name' => $origin->name,
                ],
                'budget_usd' => $budgetUsd,
            ],
            'breakdown' => [
                'purchase' => [
                    'title' => 'Стоимость авто (по бюджету)',
                    'amount_usd' => $purchase,
                ],
                'customs' => [
                    'title' => 'Таможенная пошлина',
                    'amount_usd' => $customsDuty,
                    'details' => [
                        'rate' => $dutyRate,
                    ],
                ],
                'recycling' => [
                    'title' => 'Утильсбор',
                    'amount_usd' => $recyclingFee,
                    'details' => [
                        'base' => $recyclingBase,
                        'per_hp' => $recyclingPerHp,
                        'engine_power_hp' => $carModel->engine_power_hp,
                    ],
                ],
                'logistics' => [
                    'title' => 'Логистика',
                    'amount_usd' => $logistics,
                    'details' => [
                        'origin_logistics_cost_usd' => $origin->logistics_cost_usd,
                        'brand_factor' => $brandFactor,
                    ],
                ],
                'commission' => [
                    'title' => 'Комиссия сервиса',
                    'amount_usd' => $commission,
                    'details' => [
                        'rate' => $commissionRate,
                        'min' => $commissionMin,
                    ],
                ],
            ],
            'total_usd' => $total,
        ];
    }

    private function dutyRate(string $brand, int $hp): float
    {
        $base = 0.14;
        if ($hp > 250) {
            $base += 0.03;
        } elseif ($hp > 150) {
            $base += 0.015;
        }

        return match (mb_strtolower($brand)) {
            'bmw', 'mercedes', 'audi' => $base + 0.01,
            default => $base,
        };
    }

    /**
     * @return array{0:int,1:float}
     */
    private function recyclingParams(int $hp): array
    {
        $base = 550;
        if ($hp <= 150) {
            return [$base, 8.0];
        }
        if ($hp <= 250) {
            return [$base, 12.0];
        }

        return [$base, 18.0];
    }

    private function brandLogisticsFactor(string $brand): float
    {
        return match (mb_strtolower($brand)) {
            'bmw', 'mercedes', 'audi' => 1.1,
            default => 1.0,
        };
    }
}

