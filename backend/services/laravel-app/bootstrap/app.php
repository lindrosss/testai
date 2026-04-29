<?php

use App\Http\Middleware\EnsureEmailVerifiedForInvites;
use App\Http\Middleware\EnsureEmailVerifiedForMutations;
use App\Http\Middleware\EnsureEventMember;
use App\Http\Middleware\VerifyInternalApiKey;
use App\Models\EmailLog;
use App\Support\EmailLogContext;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Session\Middleware\StartSession;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    // Laravel registers a framework EventServiceProvider that auto-discovers app/Listeners;
    // we use explicit mappings in App\Providers\EventServiceProvider only.
    ->withEvents(false)
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // За хостовым nginx / балансировщиком нужны X-Forwarded-* (см. deploy/nginx-vameo-docker-proxy.conf).
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
        ]);
        $middleware->alias([
            'event.member' => EnsureEventMember::class,
            'verified.email' => EnsureEmailVerifiedForMutations::class,
            'internal.api' => VerifyInternalApiKey::class,
            'invite.email' => EnsureEmailVerifiedForInvites::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->reportable(function (TransportExceptionInterface $e): void {
            $ctx = app(EmailLogContext::class);
            $ids = $ctx->pending();
            if ($ids === []) {
                return;
            }

            EmailLog::query()
                ->whereIn('id', $ids)
                ->where('status', 'sending')
                ->update([
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                    'failed_at' => now(),
                ]);

            $ctx->clear();
        });
    })->create();
