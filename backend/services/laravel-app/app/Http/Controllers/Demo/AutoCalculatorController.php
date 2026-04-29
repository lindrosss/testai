<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Demo\AutoCalculateRequest;
use App\Models\CarModel;
use App\Models\ShippingOrigin;
use App\Services\AutoCostCalculator;
use Illuminate\Http\JsonResponse;

class AutoCalculatorController extends Controller
{
    public function reference(): JsonResponse
    {
        $models = CarModel::query()
            ->with(['shippingOrigin:id,code,name,logistics_cost_usd,lead_time_days_min,lead_time_days_max'])
            ->orderBy('brand')
            ->orderBy('model')
            ->get(['id', 'brand', 'model', 'engine_power_hp', 'market_price_usd', 'shipping_origin_id']);

        $origins = ShippingOrigin::query()
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'logistics_cost_usd', 'lead_time_days_min', 'lead_time_days_max']);

        return response()->json([
            'car_models' => $models,
            'shipping_origins' => $origins,
        ]);
    }

    public function calculate(AutoCalculateRequest $request, AutoCostCalculator $calculator): JsonResponse
    {
        $data = $request->validated();

        $carModel = CarModel::query()
            ->with(['shippingOrigin'])
            ->findOrFail((int) $data['car_model_id']);
        $origin = $carModel->shippingOrigin;
        if ($origin === null) {
            return response()->json([
                'message' => 'Shipping origin is not configured for this model.',
            ], 422);
        }
        $budgetUsd = (int) $data['budget_usd'];

        return response()->json($calculator->calculate($carModel, $origin, $budgetUsd));
    }
}

