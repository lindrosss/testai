<?php

declare(strict_types=1);

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class MailTest extends Command
{
    protected $signature = 'mail:test {to : Recipient email} {--subject=Test email}';

    protected $description = 'Send a simple test email using the configured mailer.';

    public function handle(): int
    {
        $to = (string) $this->argument('to');
        $subject = (string) $this->option('subject');

        Mail::raw('Test email from Vameo backend at '.now()->toIso8601String(), function ($message) use ($to, $subject): void {
            $message->to($to)->subject($subject);
        });

        $this->info("Sent test email to {$to}.");

        return self::SUCCESS;
    }
}

