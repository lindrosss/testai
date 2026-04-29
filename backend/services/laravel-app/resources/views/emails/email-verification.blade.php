<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Подтвердите email</title></head>
<body>
<p>Здравствуйте@if(!empty($user_name)), {{ $user_name }}@endif!</p>
<p>Подтвердите email для {{ config('app.name') }}, нажав на кнопку ниже.</p>
@if(!empty($verification_link))
<p><a href="{{ $verification_link }}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">Подтвердить email</a></p>
<p><small>Если кнопка не работает, скопируйте эту ссылку: {{ $verification_link }}</small></p>
@endif
</body>
</html>
