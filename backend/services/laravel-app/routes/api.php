<?php

use App\Http\Controllers\AuthController;
use App\Modules\Notification\Http\Controllers\InternalEmailController;
use App\Http\Controllers\Demo\AutoCalculatorController;
use App\Http\Controllers\Demo\BotController;
use App\Http\Controllers\Demo\CallbackRequestController;
use App\Http\Controllers\Demo\StockCarController;
use Illuminate\Support\Facades\Route;

Route::post('/internal/email/send', [InternalEmailController::class, 'send'])
    ->middleware('internal.api');

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Vameo',
        'timestamp' => now()->toIso8601String(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Demo (public) — auto “под ключ” calculator
|--------------------------------------------------------------------------
*/
Route::prefix('demo')->group(function () {
    Route::get('/auto/reference', [AutoCalculatorController::class, 'reference']);
    Route::post('/auto/calculate', [AutoCalculatorController::class, 'calculate']);
    Route::get('/auto/history', [AutoCalculatorController::class, 'history']);

    Route::get('/callback-requests', [CallbackRequestController::class, 'index']);
    Route::get('/callback-requests/summary', [CallbackRequestController::class, 'summary']);
    Route::patch('/callback-requests/{id}/status', [CallbackRequestController::class, 'updateStatus']);
    Route::patch('/callback-requests/{id}/message', [CallbackRequestController::class, 'updateMessage']);

    Route::get('/stock-cars', [StockCarController::class, 'index']);
    Route::get('/stock-cars/{id}', [StockCarController::class, 'show']);
    Route::post('/stock-cars', [StockCarController::class, 'store']);
    Route::put('/stock-cars/{id}', [StockCarController::class, 'update']);
    Route::delete('/stock-cars/{id}', [StockCarController::class, 'destroy']);

    Route::post('/bot/message', [BotController::class, 'message']);
});

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'sendPasswordResetLink']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/auth/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerificationEmail']);
    Route::post('/auth/invite', [AuthController::class, 'generateInvite']);
});
