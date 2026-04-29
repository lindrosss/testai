<?php

declare(strict_types=1);

namespace App\Support;

final class DemoPhoneNormalizer
{
    public static function normalize(string $text): ?string
    {
        $digits = preg_replace('/[^\d+]/u', '', $text) ?? '';
        $digits = str_replace('++', '+', $digits);

        if (preg_match('/^\+7\d{10}$/', $digits)) {
            return $digits;
        }
        if (preg_match('/^7\d{10}$/', $digits)) {
            return '+'.$digits;
        }
        if (preg_match('/^8\d{10}$/', $digits)) {
            return '+7'.substr($digits, 1);
        }

        return null;
    }
}
