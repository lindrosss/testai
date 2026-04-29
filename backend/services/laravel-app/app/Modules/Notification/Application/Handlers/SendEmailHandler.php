<?php

declare(strict_types=1);

namespace App\Modules\Notification\Application\Handlers;

use App\Modules\Notification\Application\Commands\SendEmailCommand;
use App\Modules\Notification\Domain\Services\EmailTemplateService;
use Illuminate\Support\Facades\Mail;

class SendEmailHandler
{
    public function __construct(
        private EmailTemplateService $templates,
    ) {}

    public function handle(SendEmailCommand $command): void
    {
        $view = $this->templates->viewForTemplateKey($command->template);
        $subject = $this->templates->subjectForTemplateKey($command->template);

        Mail::send($view, $command->data, function ($message) use ($command, $subject): void {
            $message->to($command->to)->subject($subject);
        });
    }
}
