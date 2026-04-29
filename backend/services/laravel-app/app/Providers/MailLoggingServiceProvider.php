<?php

declare(strict_types=1);

namespace App\Providers;

use App\Models\EmailLog;
use App\Support\EmailLogContext;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Symfony\Component\Mime\Email;

class MailLoggingServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(EmailLogContext::class);
    }

    public function boot(): void
    {
        Event::listen(MessageSending::class, function (MessageSending $event): void {
            $message = $event->message;

            if (! $message instanceof Email) {
                return;
            }

            $id = (string) Str::uuid();
            $message->getHeaders()->addTextHeader('X-Vameo-Email-Log-Id', $id);

            $record = new EmailLog([
                'id' => $id,
                'mailer' => (string) config('mail.default'),
                'message_id' => $message->getHeaders()->get('Message-ID')?->getBodyAsString(),
                'from' => $this->addressesToArray($message->getFrom()),
                'to' => $this->addressesToArray($message->getTo()),
                'cc' => $this->addressesToArray($message->getCc()),
                'bcc' => $this->addressesToArray($message->getBcc()),
                'subject' => $message->getSubject(),
                'html' => $message->getHtmlBody(),
                'text' => $message->getTextBody(),
                'headers' => $message->getHeaders()->toString(),
                'status' => 'sending',
            ]);
            $record->save();

            app(EmailLogContext::class)->add($id);
        });

        Event::listen(MessageSent::class, function (MessageSent $event): void {
            $message = $event->message;

            if (! $message instanceof Email) {
                return;
            }

            $id = $message->getHeaders()->get('X-Vameo-Email-Log-Id')?->getBodyAsString();
            if (! is_string($id) || $id === '') {
                return;
            }

            EmailLog::query()
                ->whereKey($id)
                ->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
        });
    }

    /**
     * @param  array<int, \Symfony\Component\Mime\Address>  $addresses
     * @return array<int, array{address: string, name: string}>
     */
    private function addressesToArray(array $addresses): array
    {
        return array_map(
            static fn ($a) => ['address' => $a->getAddress(), 'name' => $a->getName()],
            $addresses,
        );
    }
}

