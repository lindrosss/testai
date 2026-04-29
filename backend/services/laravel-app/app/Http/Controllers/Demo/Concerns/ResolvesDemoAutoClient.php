<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo\Concerns;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redis;

trait ResolvesDemoAutoClient
{
    private function demoAutoClientKey(Request $request): string
    {
        $h = (string) $request->header('X-Demo-Client', '');
        if ($h !== '' && preg_match('/^[a-zA-Z0-9_-]{8,80}$/', $h)) {
            return $h;
        }

        $fallback = ($request->ip() ?? '0.0.0.0').'|'.(string) $request->userAgent();

        return 'ip_'.substr(hash('sha256', $fallback), 0, 16);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function demoAutoHistoryFromRedis(Request $request, int $maxItems = 20): array
    {
        $clientKey = $this->demoAutoClientKey($request);
        $historyKey = "demo:auto:history:{$clientKey}";
        $raw = Redis::connection('cache')->lrange($historyKey, 0, $maxItems - 1);
        $items = [];
        foreach ($raw as $row) {
            if (! is_string($row) || $row === '') {
                continue;
            }
            $decoded = json_decode($row, true);
            if (is_array($decoded)) {
                $items[] = $decoded;
            }
        }

        return $items;
    }
}
