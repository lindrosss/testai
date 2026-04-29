<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Modules\Notification\Application\Commands\SendEmailCommand;
use App\Modules\Notification\Application\Handlers\SendEmailHandler;
use App\Modules\Notification\Domain\Enums\NotificationType;
use Illuminate\Console\Command;
use Throwable;

class MailSmoke extends Command
{
    protected $signature = 'mail:smoke {to : Recipient email}';

    protected $description = 'Send all app email templates to a recipient (smoke test).';

    public function handle(SendEmailHandler $sender): int
    {
        $to = (string) $this->argument('to');

        $failures = 0;

        foreach (NotificationType::cases() as $type) {
            try {
                $sender->handle(new SendEmailCommand(
                    to: $to,
                    template: $type->value,
                    data: $this->dataFor($type),
                ));
                $this->info("OK: {$type->value}");
            } catch (Throwable $e) {
                $failures++;
                $this->error("FAIL: {$type->value} — ".$e->getMessage());
            }
        }

        return $failures === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return array<string, mixed>
     */
    private function dataFor(NotificationType $type): array
    {
        $base = [
            'user_name' => 'Test User',
            'event_name' => 'Test Event',
            'amount_cents' => 12345,
            'payer_name' => 'Test Payer',
            'description' => 'Test description',
            'expense_id' => 'exp_test_123',
            'invite_link' => 'https://example.test/invite',
            'verification_link' => 'https://example.test/verify',
            'reset_link' => 'https://example.test/reset',
            'transactions' => [
                ['from_user_id' => 'u1', 'to_user_id' => 'u2', 'amount_cents' => 1000],
            ],
        ];

        return match ($type) {
            NotificationType::EMAIL_VERIFICATION => [
                'user_name' => $base['user_name'],
                'verification_link' => $base['verification_link'],
            ],
            NotificationType::PASSWORD_RESET => [
                'user_name' => $base['user_name'],
                'reset_link' => $base['reset_link'],
            ],
            NotificationType::EVENT_INVITE => [
                'event_name' => $base['event_name'],
                'invite_link' => $base['invite_link'],
            ],
            NotificationType::EVENT_JOINED => [
                'event_name' => $base['event_name'],
            ],
            NotificationType::NEW_EXPENSE => [
                'event_name' => $base['event_name'],
                'amount_cents' => $base['amount_cents'],
                'payer_name' => $base['payer_name'],
                'description' => $base['description'],
            ],
            NotificationType::EXPENSE_REMINDER => [
                'event_name' => $base['event_name'],
                'expense_id' => $base['expense_id'],
            ],
            NotificationType::EXPENSE_CONFIRMED => [
                'event_name' => $base['event_name'],
                'amount_cents' => $base['amount_cents'],
            ],
            NotificationType::SETTLEMENT_SUGGESTIONS => [
                'event_name' => $base['event_name'],
                'transactions' => $base['transactions'],
            ],
            NotificationType::PAYMENT_REMINDER => [
                'event_name' => $base['event_name'],
                'amount_cents' => $base['amount_cents'],
            ],
            NotificationType::EVENT_CLOSED => [
                'event_name' => $base['event_name'],
            ],
        };
    }
}

