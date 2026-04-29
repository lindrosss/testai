<?php

declare(strict_types=1);

namespace App\Modules\Notification\Application\Commands;

readonly class SendEmailCommand
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function __construct(
        public string $to,
        public string $template,
        public array $data,
    ) {}
}
