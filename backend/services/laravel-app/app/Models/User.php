<?php

declare(strict_types=1);

namespace App\Models;

use App\Modules\Notification\Domain\Enums\NotificationType;
use App\Modules\Notification\Infrastructure\Services\RabbitMQPublisher;
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use SensitiveParameter;

class User extends Authenticatable implements FilamentUser, MustVerifyEmail
{
    use HasApiTokens, HasFactory, MustVerifyEmailTrait, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'has_temporary_password',
        'email_verified_at',
        'role',
        'is_blocked',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'has_temporary_password' => 'boolean',
            'is_blocked' => 'boolean',
        ];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->role === 'admin' && ! $this->is_blocked;
    }

    /**
     * Сброс пароля: письмо через RabbitMQ (task_queue → go-worker → internal API), не через канал mail уведомления.
     * Параметр — одноразовый токен сброса (совместимость с родителем: без объявления типа в сигнатуре).
     */
    public function sendPasswordResetNotification(#[SensitiveParameter] $token): void
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');
        $resetLink = $frontend.'/reset-password?token='.urlencode((string) $token)
            .'&email='.urlencode($this->email);

        app(RabbitMQPublisher::class)->publishEmailSend(
            $this->email,
            NotificationType::PASSWORD_RESET->value,
            [
                'user_name' => $this->name,
                'reset_link' => $resetLink,
            ],
        );
    }

    public function expensesPaid(): HasMany
    {
        return $this->hasMany(Expense::class, 'payer_id');
    }

    public function expenseSplits(): HasMany
    {
        return $this->hasMany(ExpenseSplit::class, 'user_id');
    }

    public function paymentsSent(): HasMany
    {
        return $this->hasMany(Payment::class, 'from_user_id');
    }

    public function paymentsReceived(): HasMany
    {
        return $this->hasMany(Payment::class, 'to_user_id');
    }
}
