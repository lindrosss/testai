<?php

declare(strict_types=1);

namespace App\Modules\Notification\Infrastructure\Services;

use Illuminate\Support\Str;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class RabbitMQPublisher
{
    public const QUEUE_TASK = 'task_queue';

    public const MESSAGE_TYPE_EMAIL_SEND = 'email.send';

    /**
     * @param  array<string, mixed>  $data
     */
    public function publishEmailSend(string $to, string $template, array $data): void
    {
        $rabbitmq = config('services.rabbitmq');

        $connection = new AMQPStreamConnection(
            $rabbitmq['host'],
            $rabbitmq['port'],
            $rabbitmq['user'],
            $rabbitmq['password'],
        );
        $channel = $connection->channel();
        $channel->queue_declare(self::QUEUE_TASK, false, true, false, false);

        $envelope = [
            'id' => (string) Str::uuid(),
            'type' => self::MESSAGE_TYPE_EMAIL_SEND,
            'created_at' => now()->toIso8601String(),
            'retry_count' => 0,
            'payload' => [
                'to' => $to,
                'template' => $template,
                'data' => $data,
            ],
        ];

        $channel->basic_publish(
            new AMQPMessage(json_encode($envelope, JSON_THROW_ON_ERROR), [
                'delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT,
            ]),
            '',
            self::QUEUE_TASK
        );

        $channel->close();
        $connection->close();
    }
}
