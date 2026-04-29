## testAI — демо “Калькулятор авто под ключ”

Проект демонстрирует полный цикл: **справочники в БД → расчет по формуле → прозрачная детализация → склад в наличии → простой бот-помощник**.

### Что делает приложение
- **Калькулятор**: клиент выбирает модель и вводит сумму → получает итоговую стоимость “под ключ” и breakdown по статьям.
- **Склад**: список автомобилей клиента “в наличии” (CRUD), подходит под формулу расчёта.
- **Бот**: отвечает на типовые вопросы (где вы находитесь, как считается, что есть в наличии) и принимает заявку “перезвоните”.

### Архитектура (упрощённо)
- **Frontend**: `frontend-react/` (React + Vite + Tailwind)
  - Страницы: `/demo/auto`, `/demo/stock`
  - Виджет бота: кнопка “Задать вопрос” в правом нижнем углу
- **Backend**: `backend/services/laravel-app/` (Laravel API)
  - Публичные эндпоинты демо: `/api/demo/*`
- **Docker Compose**: `backend/docker-compose.yml` + `backend/docker-compose.testai.yml`
  - Edge nginx (раздает SPA и проксирует `/api` в Laravel)
  - Postgres, Redis, RabbitMQ, go-worker (для демонстрации очередей)

### Модель данных (БД)
- **`shipping_origins`**: направления/страны отправления (логистика, сроки)
- **`car_models`**: справочник моделей (бренд, модель, мощность)
  - `shipping_origin_id` — направление доставки **привязано к модели** в БД
- **`stock_cars`**: “авто в наличии”
  - `car_model_id`, `shipping_origin_id`, `purchase_price_usd`, `status`
- **`callback_requests`**: заявки “перезвоните мне” (из бота)

### Как считается стоимость
Расчет реализован в `backend/services/laravel-app/app/Services/AutoCostCalculator.php`.

Итоговая стоимость:
\[
\text{total} = \text{purchase} + \text{customsDuty} + \text{recyclingFee} + \text{logistics} + \text{commission}
\]

Где:
- **purchase**: сумма, введенная клиентом (демо-допущение “цена покупки”)
- **customsDuty**: процент от purchase, зависит от бренда и мощности
- **recyclingFee**: утильсбор по ступеням мощности (hp)
- **logistics**: стоимость логистики по направлению (привязана к модели) + коэффициент бренда
- **commission**: max(мин.фикс, процент от purchase)

### API (публичные демо-эндпоинты)
- `GET /api/demo/auto/reference` — список моделей (с привязанным направлением)
- `POST /api/demo/auto/calculate` — расчет (`car_model_id`, `budget_usd`)
- `GET /api/demo/stock-cars` — склад
- `POST /api/demo/bot/message` — сообщения бота

### Локальный запуск
См. `backend/README.md` и `frontend-react/README.md`.

