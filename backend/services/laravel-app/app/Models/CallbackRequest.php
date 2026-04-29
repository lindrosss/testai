<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $name
 * @property string $phone
 * @property string $topic
 * @property string|null $message
 * @property string $status
 */
class CallbackRequest extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'topic',
        'message',
        'status',
    ];
}

