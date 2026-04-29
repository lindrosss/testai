<?php

declare(strict_types=1);

namespace App\Http\Requests\Demo;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StockCarUpsertRequest extends FormRequest
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
            'vin' => ['nullable', 'string', 'max:32'],
            'car_model_id' => ['required', 'integer', 'exists:car_models,id'],
            'shipping_origin_id' => ['required', 'integer', 'exists:shipping_origins,id'],
            'purchase_price_usd' => ['required', 'integer', 'min:1', 'max:500000'],
            'status' => ['required', 'string', Rule::in(['in_stock', 'reserved', 'sold'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}

