<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 */
class EmailLog extends Model
{
    protected $table = 'email_logs';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'mailer',
        'message_id',
        'from',
        'to',
        'cc',
        'bcc',
        'subject',
        'html',
        'text',
        'headers',
        'status',
        'error',
        'sent_at',
        'failed_at',
    ];

    protected $casts = [
        'from' => 'array',
        'to' => 'array',
        'cc' => 'array',
        'bcc' => 'array',
        'sent_at' => 'datetime',
        'failed_at' => 'datetime',
    ];
}

