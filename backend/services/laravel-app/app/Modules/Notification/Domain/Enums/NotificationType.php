<?php

declare(strict_types=1);

namespace App\Modules\Notification\Domain\Enums;

enum NotificationType: string
{
    case EMAIL_VERIFICATION = 'email-verification';
    case PASSWORD_RESET = 'password-reset';
    case EVENT_INVITE = 'event-invite';
    case EVENT_JOINED = 'event-joined';
    case NEW_EXPENSE = 'new-expense';
    case EXPENSE_REMINDER = 'expense-reminder';
    case EXPENSE_CONFIRMED = 'expense-confirmed';
    case SETTLEMENT_SUGGESTIONS = 'settlement-suggestions';
    case PAYMENT_REMINDER = 'payment-reminder';
    case EVENT_CLOSED = 'event-closed';
}
