<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyInternalApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = config('services.internal.api_key');
        if ($key === null || $key === '' || $request->header('X-API-Key') !== $key) {
            return response()->json(['message' => __('Unauthorized')], 401);
        }

        return $next($request);
    }
}
