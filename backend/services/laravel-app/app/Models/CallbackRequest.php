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
 * @property array<string, mixed>|null $meta
 * @property string $status
 */
class CallbackRequest extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'topic',
        'message',
        'meta',
        'status',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }
}
