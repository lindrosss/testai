<?php

declare(strict_types=1);

namespace App\Modules\Notification\Domain\Services;

use App\Modules\Notification\Domain\Enums\NotificationType;
use InvalidArgumentException;

class EmailTemplateService
{
    public function getTemplatePath(NotificationType $type): string
    {
        return 'emails.'.$type->value;
    }

    public function getSubject(NotificationType $type): string
    {
        return match ($type) {
            NotificationType::EMAIL_VERIFICATION => 'Подтвердите email',
            NotificationType::PASSWORD_RESET => 'Сброс пароля',
            NotificationType::EVENT_INVITE => 'Приглашение в событие',
            NotificationType::EVENT_JOINED => 'Вы присоединились к событию',
            NotificationType::NEW_EXPENSE => 'Новый расход',
            NotificationType::EXPENSE_REMINDER => 'Напоминание: подтвердите свою долю расхода',
            NotificationType::EXPENSE_CONFIRMED => 'Расход подтверждён',
            NotificationType::SETTLEMENT_SUGGESTIONS => 'Предложенные переводы для расчёта',
            NotificationType::PAYMENT_REMINDER => 'Напоминание: ожидающий платёж',
            NotificationType::EVENT_CLOSED => 'Событие закрыто',
        };
    }

    public function subjectForTemplateKey(string $templateKey): string
    {
        return $this->getSubject($this->notificationTypeFromTemplateKey($templateKey));
    }

    public function viewForTemplateKey(string $templateKey): string
    {
        return $this->getTemplatePath($this->notificationTypeFromTemplateKey($templateKey));
    }

    private function notificationTypeFromTemplateKey(string $templateKey): NotificationType
    {
        $type = NotificationType::tryFrom($templateKey);
        if ($type === null) {
            throw new InvalidArgumentException(__('Unknown email template.'));
        }

        return $type;
    }
}
