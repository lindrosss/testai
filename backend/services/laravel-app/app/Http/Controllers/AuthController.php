<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\UserRegistered;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Models\User;
use App\Modules\Notification\Domain\Enums\NotificationType;
use App\Modules\Notification\Infrastructure\Services\RabbitMQPublisher;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    /**
     * Единый payload пользователя для SPA: всегда есть `email_verified_at` (null или ISO).
     *
     * @return array<string, mixed>
     */
    private function apiUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'has_temporary_password' => $user->has_temporary_password,
            'role' => $user->role,
            'is_blocked' => $user->is_blocked,
        ];
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        event(new UserRegistered($user));

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $this->apiUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        if ($user->has_temporary_password && ! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
            $user->refresh();
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $this->apiUser($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User $auth */
        $auth = $request->user();
        $auth->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        /** @var User $u */
        $u = $request->user();

        return response()->json([
            'user' => $this->apiUser($u),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $data = $request->validated();
        /** @var User $user */
        $user = $request->user();
        if (array_key_exists('name', $data)) {
            $user->name = $data['name'];
        }
        if (array_key_exists('email', $data)) {
            $user->email = $data['email'];
        }
        if (! empty($data['password'])) {
            if (! Hash::check((string) ($data['current_password'] ?? ''), $user->password)) {
                return response()->json([
                    'message' => __('The current password is incorrect.'),
                    'errors' => [
                        'current_password' => [__('The current password is incorrect.')],
                    ],
                ], 422);
            }

            $user->password = $data['password'];
            $user->has_temporary_password = false;
        }
        $user->save();

        return response()->json([
            'message' => __('Profile updated successfully.'),
            'user' => $this->apiUser($user->fresh()),
        ]);
    }

    public function sendPasswordResetLink(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['message' => __($status)], 422);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'has_temporary_password' => false,
                ])->save();
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json(['message' => __($status)]);
        }

        return response()->json(['message' => __($status)], 422);
    }

    public function generateInvite(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        /** @var User $inviter */
        $inviter = $request->user();

        $payload = json_encode([
            'email' => $request->email,
            'invited_by' => $inviter->id,
            'expires_at' => now()->addDays(7)->toIso8601String(),
        ], JSON_THROW_ON_ERROR);

        $encrypted = Crypt::encryptString($payload);
        $inviteUrl = rtrim((string) config('app.frontend_url'), '/').'?invite='.urlencode($encrypted);

        app(RabbitMQPublisher::class)->publishEmailSend(
            $request->email,
            NotificationType::EVENT_INVITE->value,
            [
                'event_name' => (string) config('app.name', 'Vameo'),
                'invite_link' => $inviteUrl,
            ],
        );

        return response()->json([
            'message' => 'Invite sent.',
            'invite_url' => $inviteUrl,
        ]);
    }

    public function verifyEmail(Request $request): JsonResponse|\Illuminate\Http\RedirectResponse
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');

        $accept = (string) $request->header('Accept', '');
        $wantsJson = str_contains($accept, 'application/json')
            || str_contains((string) $request->header('X-Requested-With', ''), 'XMLHttpRequest');

        $redirect = static function (string $kind, string $message) use ($frontend): \Illuminate\Http\RedirectResponse {
            $params = http_build_query([
                'notice' => $kind,
                'msg' => $message,
            ], '', '&', PHP_QUERY_RFC3986);

            return redirect()->to($frontend.'/dashboard?'.$params);
        };

        if (! $request->hasValidSignature()) {
            if ($wantsJson) {
                return response()->json(['message' => 'Invalid or expired signature.'], 403);
            }

            return $redirect('error', 'Ссылка подтверждения недействительна или устарела.');
        }

        /** @var string $hash */
        $hash = $request->route('hash');
        $user = User::findOrFail($request->route('id'));

        if ($user->hasVerifiedEmail()) {
            if ($wantsJson) {
                return response()->json([
                    'message' => 'Email already verified.',
                ]);
            }

            return $redirect('info', 'Email уже подтверждён.');
        }

        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            if ($wantsJson) {
                return response()->json(['message' => 'Invalid verification link.'], 403);
            }

            return $redirect('error', 'Ссылка подтверждения недействительна.');
        }

        $user->markEmailAsVerified();

        if ($wantsJson) {
            return response()->json([
                'message' => 'Email verified successfully.',
            ]);
        }

        return $redirect('success', 'Email успешно подтверждён.');
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ], 400);
        }

        event(new UserRegistered($user));

        return response()->json([
            'message' => 'Verification email sent.',
        ]);
    }
}
