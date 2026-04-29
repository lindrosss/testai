<?php

declare(strict_types=1);

namespace App\Modules\Admin\Filament\Widgets;

use App\Models\User;
use Filament\Widgets\ChartWidget;

class UsersChartWidget extends ChartWidget
{
    protected ?string $heading = 'User registrations (7 days)';

    protected function getData(): array
    {
        $labels = [];
        $data = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = now()->subDays($i)->toDateString();
            $labels[] = $day;
            $data[] = User::query()->whereDate('created_at', $day)->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Registrations',
                    'data' => $data,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
