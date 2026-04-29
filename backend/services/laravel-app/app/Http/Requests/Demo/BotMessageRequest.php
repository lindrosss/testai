<?php

declare(strict_types=1);

namespace App\Http\Requests\Demo;

use Illuminate\Foundation\Http\FormRequest;

class BotMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:2000'],
            'context' => ['nullable', 'array'],
            'context.next' => ['nullable', 'string', 'max:50'],
            'context.name' => ['nullable', 'string', 'max:120'],
            'context.topic' => ['nullable', 'string', 'max:50'],
        ];
    }
}

