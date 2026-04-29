<!DOCTYPE html>
<html lang="ru">
<head><meta charset="utf-8"><title>Сброс пароля</title></head>
<body>
<p>Здравствуйте@if(!empty($user_name)), {{ $user_name }}@endif!</p>
<p>Вы запросили сброс пароля для {{ config('app.name') }}.</p>
@if(!empty($reset_link))
<p><a href="{{ $reset_link }}">Сбросить пароль</a></p>
<p><small>Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.</small></p>
@endif
</body>
</html>
