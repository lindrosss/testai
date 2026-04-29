<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Demo\CallbackRequestMessageRequest;
use App\Http\Requests\Demo\CallbackRequestStatusRequest;
use App\Models\CallbackRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CallbackRequestController extends Controller
{
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

