<?php

declare(strict_types=1);

namespace App\Modules\Notification\Http\Controllers;

use App\Modules\Notification\Application\Commands\SendEmailCommand;
use App\Modules\Notification\Application\Handlers\SendEmailHandler;
use App\Modules\Notification\Domain\Enums\NotificationType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InternalEmailController
{
    public function __construct(
        private SendEmailHandler $sendEmail,
    ) {}

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'to' => ['required', 'email'],
            'template' => ['required', 'string'],
            'data' => ['required', 'array'],
        ]);

        $allowed = array_map(static fn (NotificationType $t) => $t->value, NotificationType::cases());
        if (! in_array($validated['template'], $allowed, true)) {
            return response()->json(['message' => __('Invalid template.')], 422);
        }

        $this->sendEmail->handle(new SendEmailCommand(
            $validated['to'],
            $validated['template'],
            $validated['data'],
        ));

        return response()->json(['message' => __('Email queued.')]);
    }
}
