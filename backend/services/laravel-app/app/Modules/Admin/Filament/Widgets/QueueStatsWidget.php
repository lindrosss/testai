<?php

declare(strict_types=1);

namespace App\Modules\Admin\Filament\Widgets;

use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\Http;

class QueueStatsWidget extends BaseWidget
{
    protected function getStats(): array
    {
        $url = config('services.rabbitmq.management_url');
        $user = config('services.rabbitmq.user');
        $pass = config('services.rabbitmq.password');
        $queue = 'task_queue';

        if ($url === null || $url === '') {
            return [
                Stat::make('RabbitMQ queue', 'N/A (set RABBITMQ_MANAGEMENT_URL)'),
            ];
        }

        try {
            $path = '/api/queues/%2F/'.urlencode($queue);
            $response = Http::withBasicAuth((string) $user, (string) $pass)
                ->timeout(3)
                ->get(rtrim((string) $url, '/').$path);
            if (! $response->successful()) {
                return [Stat::make('RabbitMQ', 'Error '.$response->status())];
            }
            $messages = $response->json('messages') ?? $response->json('messages_ready');

            return [
                Stat::make('Queue '.$queue, (string) ($messages ?? '?')),
            ];
        } catch (\Throwable) {
            return [Stat::make('RabbitMQ', 'Unavailable')];
        }
    }
}
