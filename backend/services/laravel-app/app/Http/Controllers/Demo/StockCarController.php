<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Demo\StockCarUpsertRequest;
use App\Models\StockCar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockCarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $q = StockCar::query()
            ->with([
                'carModel:id,brand,model,engine_power_hp,market_price_usd',
                'shippingOrigin:id,code,name,logistics_cost_usd,lead_time_days_min,lead_time_days_max',
            ])
            ->orderByDesc('id');

        if (is_string($status) && $status !== '') {
            $q->where('status', $status);
        }

        return response()->json([
            'data' => $q->paginate(20),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $car = StockCar::query()
            ->with([
                'carModel:id,brand,model,engine_power_hp,market_price_usd',
                'shippingOrigin:id,code,name,logistics_cost_usd,lead_time_days_min,lead_time_days_max',
            ])
            ->findOrFail($id);

        return response()->json([
            'data' => $car,
        ]);
    }

    public function store(StockCarUpsertRequest $request): JsonResponse
    {
        $car = StockCar::query()->create($request->validated());

        return response()->json([
            'data' => $car->load(['carModel', 'shippingOrigin']),
        ], 201);
    }

    public function update(StockCarUpsertRequest $request, int $id): JsonResponse
    {
        $car = StockCar::query()->findOrFail($id);
        $car->fill($request->validated());
        $car->save();

        return response()->json([
            'data' => $car->load(['carModel', 'shippingOrigin']),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $car = StockCar::query()->findOrFail($id);
        $car->delete();

        return response()->json([
            'message' => 'Deleted.',
        ]);
    }
}

