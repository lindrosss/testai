<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Demo\AutoCalculateRequest;
use App\Models\CarModel;
use App\Models\ShippingOrigin;
use App\Services\AutoCostCalculator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Str;

class AutoCalculatorController extends Controller
{
    private const CALC_CACHE_TTL_SECONDS = 3600; // 1 hour
    private const HISTORY_TTL_SECONDS = 604800; // 7 days
    private const HISTORY_MAX_ITEMS = 20;

    public function reference(AutoCostCalculator $calculator): JsonResponse
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
            'car_models' => $models->map(function (CarModel $m) use ($calculator) {
                $arr = $m->toArray();
                $arr['recycling'] = $calculator->recyclingPreview((int) $m->engine_power_hp);
                return $arr;
            })->values(),
            'shipping_origins' => $origins,
        ]);
    }

    public function calculate(AutoCalculateRequest $request, AutoCostCalculator $calculator): JsonResponse
    {
        $data = $request->validated();

        $clientKey = $this->clientKey($request);
        $budgetUsd = (int) $data['budget_usd'];
        $carModelId = (int) $data['car_model_id'];
        $calcCacheKey = $this->calcCacheKey($clientKey, $carModelId, $budgetUsd);
        $historyKey = $this->historyKey($clientKey);
        $redis = Redis::connection('cache');

        $cachedJson = $redis->get($calcCacheKey);
        if (is_string($cachedJson) && $cachedJson !== '') {
            $cached = json_decode($cachedJson, true);
            if (is_array($cached)) {
                $this->pushHistory($redis, $historyKey, [
                    'id' => (string) Str::uuid(),
                    'at' => now()->toIso8601String(),
                    'input' => [
                        'car_model_id' => $carModelId,
                        'budget_usd' => $budgetUsd,
                    ],
                    'result' => [
                        'total_usd' => $cached['total_usd'] ?? null,
                        'car_model' => $cached['input']['car_model'] ?? null,
                        'origin' => $cached['input']['origin'] ?? null,
                    ],
                    'from_cache' => true,
                ]);

                $cached['meta'] = array_merge((array) ($cached['meta'] ?? []), [
                    'from_cache' => true,
                ]);
                return response()->json($cached);
            }
        }

        $carModel = CarModel::query()
            ->with(['shippingOrigin'])
            ->findOrFail($carModelId);
        $origin = $carModel->shippingOrigin;
        if ($origin === null) {
            return response()->json([
                'message' => 'Shipping origin is not configured for this model.',
            ], 422);
        }

        $result = $calculator->calculate($carModel, $origin, $budgetUsd);
        $result['meta'] = array_merge((array) ($result['meta'] ?? []), [
            'from_cache' => false,
        ]);

        $redis->setex($calcCacheKey, self::CALC_CACHE_TTL_SECONDS, json_encode($result, JSON_UNESCAPED_UNICODE));
        $this->pushHistory($redis, $historyKey, [
            'id' => (string) Str::uuid(),
            'at' => now()->toIso8601String(),
            'input' => [
                'car_model_id' => $carModelId,
                'budget_usd' => $budgetUsd,
            ],
            'result' => [
                'total_usd' => $result['total_usd'] ?? null,
                'car_model' => $result['input']['car_model'] ?? null,
                'origin' => $result['input']['origin'] ?? null,
            ],
            'from_cache' => false,
        ]);

        return response()->json($result);
    }

    public function history(Request $request): JsonResponse
    {
        $clientKey = $this->clientKey($request);
        $historyKey = $this->historyKey($clientKey);
        $redis = Redis::connection('cache');

        $raw = $redis->lrange($historyKey, 0, self::HISTORY_MAX_ITEMS - 1);
        $items = [];
        foreach ($raw as $row) {
            if (!is_string($row) || $row === '') {
                continue;
            }
            $decoded = json_decode($row, true);
            if (is_array($decoded)) {
                $items[] = $decoded;
            }
        }

        return response()->json([
            'data' => $items,
        ]);
    }

    private function clientKey(Request $request): string
    {
        $h = (string) $request->header('X-Demo-Client', '');
        if ($h !== '' && preg_match('/^[a-zA-Z0-9_-]{8,80}$/', $h)) {
            return $h;
        }

        $fallback = ($request->ip() ?? '0.0.0.0').'|'.(string) $request->userAgent();

        return 'ip_'.substr(hash('sha256', $fallback), 0, 16);
    }

    private function calcCacheKey(string $clientKey, int $carModelId, int $budgetUsd): string
    {
        return "demo:auto:calc:{$clientKey}:{$carModelId}:{$budgetUsd}";
    }

    private function historyKey(string $clientKey): string
    {
        return "demo:auto:history:{$clientKey}";
    }

    /**
     * @param array<string,mixed> $entry
     */
    private function pushHistory($redis, string $key, array $entry): void
    {
        $redis->lpush($key, json_encode($entry, JSON_UNESCAPED_UNICODE));
        $redis->ltrim($key, 0, self::HISTORY_MAX_ITEMS - 1);
        $redis->expire($key, self::HISTORY_TTL_SECONDS);
    }
}

