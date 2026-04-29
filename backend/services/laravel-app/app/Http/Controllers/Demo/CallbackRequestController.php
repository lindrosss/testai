<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Demo\Concerns\ResolvesDemoAutoClient;
use App\Http\Requests\Demo\CallbackFromCalculatorRequest;
use App\Http\Requests\Demo\CallbackRequestMessageRequest;
use App\Http\Requests\Demo\CallbackRequestStatusRequest;
use App\Models\CallbackRequest;
use App\Support\DemoPhoneNormalizer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallbackRequestController extends Controller
{
    use ResolvesDemoAutoClient;

    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status');

        $q = CallbackRequest::query()
            ->orderByDesc('id');

        if (is_string($status) && $status !== '') {
            $q->where('status', $status);
        }

        return response()->json([
            'data' => $q->paginate(20),
        ]);
    }

    public function storeFromCalculator(CallbackFromCalculatorRequest $request): JsonResponse
    {
        $rawPhone = (string) $request->validated('phone');
        $phone = DemoPhoneNormalizer::normalize($rawPhone);
        if ($phone === null) {
            return response()->json([
                'message' => 'Не вижу номер телефона. Укажите в формате +7XXXXXXXXXX.',
            ], 422);
        }

        $history = $this->demoAutoHistoryFromRedis($request, 20);
        if ($history === []) {
            return response()->json([
                'message' => 'История расчётов пуста. Сначала выполните хотя бы один расчёт.',
            ], 422);
        }

        $row = CallbackRequest::query()->create([
            'phone' => $phone,
            'topic' => 'calculator',
            'message' => null,
            'status' => 'new',
            'meta' => [
                'source' => 'calculator',
                'calc_history' => $history,
            ],
        ]);

        return response()->json([
            'data' => $row,
        ], 201);
    }

    public function summary(): JsonResponse
    {
        $counts = CallbackRequest::query()
            ->selectRaw('status, COUNT(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->all();

        return response()->json([
            'data' => [
                'counts' => $counts,
                'new_count' => (int) ($counts['new'] ?? 0),
            ],
        ]);
    }

    public function updateStatus(CallbackRequestStatusRequest $request, int $id): JsonResponse
    {
        $row = CallbackRequest::query()->findOrFail($id);
        $row->status = (string) $request->validated('status');
        $row->save();

        return response()->json([
            'data' => $row,
        ]);
    }

    public function updateMessage(CallbackRequestMessageRequest $request, int $id): JsonResponse
    {
        $row = CallbackRequest::query()->findOrFail($id);
        $row->message = $request->validated('message');
        $row->save();

        return response()->json([
            'data' => $row,
        ]);
    }
}
