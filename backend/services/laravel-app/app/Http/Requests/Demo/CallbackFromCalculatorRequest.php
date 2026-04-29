<?php

declare(strict_types=1);

namespace App\Http\Requests\Demo;

use Illuminate\Foundation\Http\FormRequest;

class CallbackFromCalculatorRequest extends FormRequest
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
            'phone' => ['required', 'string', 'max:32'],
        ];
    }
}
