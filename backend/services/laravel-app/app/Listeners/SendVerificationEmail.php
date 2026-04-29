<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\UserRegistered;
use App\Modules\Notification\Domain\Enums\NotificationType;
use App\Modules\Notification\Infrastructure\Services\RabbitMQPublisher;
use Illuminate\Support\Facades\URL;

class SendVerificationEmail
{
    public function handle(UserRegistered $event): void
    {
        $user = $event->user;

        $signedApiUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
                'id' => $user->id,
                'hash' => sha1($user->getEmailForVerification()),
            ]
        );

        $frontendBase = rtrim((string) config('app.frontend_url'), '/');
        // Make URLs protocol-relative for smoother http→https migration.
        // If FRONTEND_URL is already "//vameo.ru", keep it as-is.
        $frontendBase = preg_replace('#^https?:#i', '', $frontendBase) ?? $frontendBase;

        // Ссылка на SPA: пользователь сам нажимает «Подтвердить» — иначе GET на API дергают сканеры почты.
        $verificationLink = $frontendBase
            .'/verify-email?'
            .http_build_query(['target' => $signedApiUrl], '', '&', PHP_QUERY_RFC3986);

        app(RabbitMQPublisher::class)->publishEmailSend(
            $user->email,
            NotificationType::EMAIL_VERIFICATION->value,
            [
                'user_name' => $user->name,
                'verification_link' => $verificationLink,
            ],
        );
    }
}
