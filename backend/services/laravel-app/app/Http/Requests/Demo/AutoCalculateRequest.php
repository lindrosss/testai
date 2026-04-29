<?php

declare(strict_types=1);

namespace App\Http\Requests\Demo;

use Illuminate\Foundation\Http\FormRequest;

class AutoCalculateRequest extends FormRequest
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
            'car_model_id' => ['required', 'integer', 'exists:car_models,id'],
            'budget_usd' => ['required', 'integer', 'min:1', 'max:1000000'],
        ];
    }
}

