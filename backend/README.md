# Vameo Backend

Сервис учёта групповых расходов. Backend на Laravel, PostgreSQL+TimescaleDB, Redis, RabbitMQ, Go worker.

Обычно вы клонируете **этот** репозиторий и работаете из его корня. Если вложено в монорепозиторий — откройте каталог `backend/` и выполняйте команды оттуда.

Команды `docker compose` и `make` выполняйте **из корня этого репозитория** (каталога `backend` в монорепо).

React SPA вынесен в отдельный репозиторий и свой Docker Compose: [vameo-frontend-react](https://github.com/lindrosss/vameo-frontend-react) (стек `frontend-vameo` в Docker Desktop). Поднимайте фронт отдельно после старта API.

## Требования к системе

| Программа | Версия | Проверка |
|-----------|--------|----------|
| Docker | 24.0+ | `docker --version` |
| Docker Compose | 2.20+ | `docker compose version` |
| Git | 2.30+ | `git --version` |
| curl | 7.0+ | `curl --version` |

## Быстрый старт (5 минут)

```bash
# 1. Клонирование репозитория
git clone <repo-url>
cd <repo>

# 2. Копирование конфига окружения
cp services/laravel-app/.env.example services/laravel-app/.env

# 3. Запуск контейнеров
docker compose up -d

# 4. Зависимости Composer (без каталога vendor artisan и API не работают). С хоста:
#    cd services/laravel-app && composer install
#    или из корня: make composer-install
docker compose exec laravel-app composer install --no-interaction --prefer-dist --ignore-platform-req=ext-sockets

# 5. Проверка (порт API см. VAMEO_NGINX_HTTP_PORT в .env, по умолчанию 8080)
curl http://localhost:8080/api/health
```

После `docker compose build laravel-app` с обновлённым Dockerfile (расширение `sockets`) флаг `--ignore-platform-req=ext-sockets` можно не указывать.

## Известные проблемы и решения

### Проблема: go-worker не собирается с ошибкой checksum mismatch

**Решение:**

```bash
cd services/go-worker
rm go.sum
docker run --rm -v $(pwd):/app -w /app golang:1.22-alpine go mod download
docker run --rm -v $(pwd):/app -w /app golang:1.22-alpine go mod tidy
```

## Деплой на VPS (без перезаписи `.env`)

Файл **`services/laravel-app/.env`** в **`.gitignore`** — при обычном `git pull` Git его **не меняет и не удаляет**. Секреты живут только на сервере.

**Рекомендуемая раскладка каталогов:**

```text
/var/www/vameo/backend           ← репозиторий vameo-backend (здесь docker-compose.yml)
/var/www/vameo/frontend-react    ← репозиторий vameo-frontend-react (нужен для build `../frontend-react`)
```

**Один раз на сервере:**

```bash
cd /var/www/vameo
git clone https://github.com/lindrosss/vameo-backend.git backend
git clone https://github.com/lindrosss/vameo-frontend-react.git frontend-react
cd backend
cp services/laravel-app/.env.example services/laravel-app/.env
nano services/laravel-app/.env   # production, пароли, APP_URL, JWT_SECRET, CORS, Sanctum и т.д.
chmod +x scripts/deploy.sh
docker compose up -d --build
docker compose exec laravel-app php artisan key:generate --force
docker compose exec laravel-app php artisan migrate --force
```

**Каждый выкат изменений из GitHub:**

```bash
cd /var/www/vameo/backend
./scripts/deploy.sh
```

Скрипт делает `git pull` в **backend** и **frontend-react** (если есть `.git`), затем `docker compose build`, `up -d`, **`composer install` от root в контейнере** (иначе на bind-mount с хоста пользователь `www-data` часто не может создать `vendor/`), затем `chown` на `www-data` для `vendor`, `storage`, `bootstrap/cache`, далее `migrate --force`, при `APP_ENV=production` — `config:cache` и `route:cache`.

Другая ветка: `DEPLOY_BRANCH=staging ./scripts/deploy.sh`. Другой путь к фронту: `FRONTEND_ROOT=/opt/frontend-react ./scripts/deploy.sh`.

**Если в каталоге backend нет `.git`** (когда-то скопировали только файлы) — клонируйте репозиторий заново в отдельную папку, **скопируйте** старый `.env` в `services/laravel-app/.env`, затем подмените каталог или переключите симлинк.

### Домен и порт 80 (рекомендуемая схема)

Docker публикует edge nginx на **`8080`** (см. `VAMEO_NGINX_HTTP_PORT` в `.env` рядом с `docker-compose.yml`). Браузер по **`http://vameo.ru`** ходит на **порт 80**, поэтому на ВМ нужен **системный nginx на 80**, проксирующий на **`127.0.0.1:8080`**.

1. В **`backend/.env`** оставьте **`VAMEO_NGINX_HTTP_PORT=8080`** (или не задавайте — по умолчанию 8080).
2. В **`services/laravel-app/.env`**: **`APP_URL=http://vameo.ru`**, **`CORS_ALLOWED_ORIGINS`**, **`SANCTUM_STATEFUL_DOMAINS`** — с вашим доменом (без `:8080`).
3. Под **root** на сервере:

```bash
apt install -y nginx
cp /var/www/vameo/backend/deploy/nginx-vameo-docker-proxy.conf /etc/nginx/sites-available/vameo
ln -sf /etc/nginx/sites-available/vameo /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

Проверка: `curl -sI http://vameo.ru/login` с вашего ПК. Внутри ВМ: `curl -sI -H 'Host: vameo.ru' http://127.0.0.1:8080/login`.

**Почему не только `VAMEO_NGINX_HTTP_PORT=80` в Docker:** часто порт 80 на хосте уже занят панелью или нужен отдельный слой для Let’s Encrypt — отдельный nginx проще сопровождать.

## Монорепозиторий на GitHub

Если в `main` лежит корень монорепо с папками `backend/` и `frontend/`, клонируйте репозиторий и переходите в `backend/`, затем используйте те же команды с путями `services/laravel-app` и т.д.
