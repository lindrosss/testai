<?php

declare(strict_types=1);

namespace App\Http\Controllers\Demo;

use App\Http\Controllers\Controller;
use App\Http\Requests\Demo\BotMessageRequest;
use App\Models\CallbackRequest;
use App\Models\StockCar;
use App\Support\DemoPhoneNormalizer;
use Illuminate\Http\JsonResponse;

class BotController extends Controller
{
    public function message(BotMessageRequest $request): JsonResponse
    {
        $message = trim((string) $request->validated('message'));
        /** @var array<string,mixed> $context */
        $context = (array) ($request->validated('context') ?? []);

        $next = isset($context['next']) ? (string) $context['next'] : '';

        // Step-based flow: callback phone
        if ($next === 'callback_phone') {
            $phone = DemoPhoneNormalizer::normalize($message);
            if ($phone === null) {
                return $this->reply(
                    'Не вижу номер телефона. Напишите, пожалуйста, в формате +7XXXXXXXXXX.',
                    ['Отменить'],
                    ['next' => 'callback_phone'] + $context,
                );
            }

            CallbackRequest::query()->create([
                'name' => isset($context['name']) ? (string) $context['name'] : null,
                'phone' => $phone,
                'topic' => isset($context['topic']) ? (string) $context['topic'] : 'callback',
                'message' => $context['message'] ?? null,
                'status' => 'new',
            ]);

            return $this->reply(
                "Принято. Мы перезвоним на {$phone} в ближайшее время.",
                ['Какие авто в наличии?', 'Как считается стоимость?'],
                ['next' => null],
            );
        }

        $m = mb_strtolower($message);

        if ($this->hasAny($m, ['отмен', 'стоп', 'cancel'])) {
            return $this->reply('Ок, отменил.', $this->defaultQuickReplies(), ['next' => null]);
        }

        if ($this->hasAny($m, ['где', 'адрес', 'находитесь', 'локац', 'офис'])) {
            return $this->reply(
                'Мы находимся в Москве. Работаем дистанционно по РФ: консультация и подбор — онлайн, оформление — по договору.',
                $this->defaultQuickReplies(),
            );
        }

        if ($this->hasAny($m, ['как счит', 'формул', 'расчет', 'расчёт', 'вид расчет', 'вид расч'])) {
            return $this->reply(
                "Считаем стоимость \"под ключ\": бюджет на авто + таможенная пошлина + утильсбор (зависит от мощности) + логистика (привязана к модели) + комиссия сервиса.\nВ результате показываем детализацию по пунктам.",
                ['Какие авто в наличии?', 'Перезвоните мне'],
            );
        }

        if ($this->hasAny($m, ['перезвон', 'позвон', 'call me', 'связ', 'контакт'])) {
            return $this->reply(
                'Конечно. Напишите ваш номер телефона (например, +79991234567) — и мы перезвоним.',
                ['Отменить'],
                ['next' => 'callback_phone', 'topic' => 'callback', 'message' => $message],
            );
        }

        if ($this->hasAny($m, ['в наличии', 'налич', 'склад', 'какие авто', 'автомобили', 'машин'])) {
            $items = StockCar::query()
                ->where('status', 'in_stock')
                ->with(['carModel:id,brand,model,engine_power_hp', 'shippingOrigin:id,name'])
                ->orderByDesc('id')
                ->limit(5)
                ->get();

            if ($items->isEmpty()) {
                return $this->reply(
                    'Сейчас нет позиций со статусом “В наличии”. Могу оформить подбор под ваш бюджет.',
                    ['Как считается стоимость?', 'Перезвоните мне'],
                );
            }

            $lines = $items->map(function (StockCar $c): string {
                $brand = (string) ($c->carModel?->brand ?? '');
                $model = (string) ($c->carModel?->model ?? '');
                $hp = (int) ($c->carModel?->engine_power_hp ?? 0);
                $origin = (string) ($c->shippingOrigin?->name ?? '');
                $price = (int) $c->purchase_price_usd;

                $suffix = $origin !== '' ? " · {$origin}" : '';

                return "- {$brand} {$model} ({$hp} hp) · \${$price}{$suffix}";
            })->implode("\n");

            return $this->reply(
                "Сейчас в наличии:\n{$lines}",
                ['Открыть склад', 'Рассчитать стоимость'],
            );
        }

        if ($this->hasAny($m, ['склад открыть', 'открыть склад', 'покажи склад'])) {
            return response()->json([
                'reply' => 'Откройте вкладку “Параметры” вверху — там зависимости по моделям.',
                'quick_replies' => $this->defaultQuickReplies(),
                'context' => ['next' => null],
            ]);
        }

        if ($this->hasAny($m, ['рассчитать', 'калькулятор', 'посчитать'])) {
            return $this->reply(
                'Откройте вкладку “Калькулятор”, выберите модель и бюджет — я покажу итог и детализацию.',
                ['Какие авто в наличии?', 'Перезвоните мне'],
            );
        }

        return $this->reply(
            "Я могу помочь с простыми вопросами:\n- где мы находимся\n- как считается стоимость\n- какие авто сейчас в наличии\n- попросить перезвонить\n\nСпросите, например: “Какие авто в наличии?”",
            $this->defaultQuickReplies(),
        );
    }

    /**
     * @param  array<int,string>  $quickReplies
     * @param  array<string,mixed>|null  $context
     */
    private function reply(string $text, array $quickReplies = [], ?array $context = null): JsonResponse
    {
        return response()->json([
            'reply' => $text,
            'quick_replies' => $quickReplies,
            'context' => $context ?? ['next' => null],
        ]);
    }

    /**
     * @return array<int,string>
     */
    private function defaultQuickReplies(): array
    {
        return [
            'Где вы находитесь?',
            'Как считается стоимость?',
            'Какие авто в наличии?',
            'Перезвоните мне',
        ];
    }

    /**
     * @param  array<int,string>  $needles
     */
    private function hasAny(string $haystack, array $needles): bool
    {
        foreach ($needles as $n) {
            if ($n !== '' && str_contains($haystack, $n)) {
                return true;
            }
        }

        return false;
    }
}
