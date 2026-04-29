#!/usr/bin/env bash
# Деплой с сервера: обновление кода из Git + пересборка контейнеров + миграции.
# .env в services/laravel-app/ не в репозитории (.gitignore) — git pull его не трогает.
#
# Раскладка каталогов (рекомендуется):
#   /var/www/vameo/backend          ← этот репозиторий (docker-compose.yml в корне)
#   /var/www/vameo/frontend-react   ← vameo-frontend-react (сборка SPA из ../frontend-react)
#
# Однократно: chmod +x scripts/deploy.sh
# Запуск из корня backend: ./scripts/deploy.sh
#
# Переменные окружения (опционально):
#   DEPLOY_BRANCH=main          ветка для git pull
#   FRONTEND_ROOT=/path/to/frontend-react   если фронт не в ../frontend-react относительно родителя backend

set -euo pipefail

BACKEND_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$BACKEND_ROOT"

BRANCH="${DEPLOY_BRANCH:-main}"

parent="$(cd "$BACKEND_ROOT/.." && pwd)"
DEFAULT_FRONTEND="$parent/frontend-react"
FRONTEND_ROOT="${FRONTEND_ROOT:-$DEFAULT_FRONTEND}"

if [[ ! -f services/laravel-app/.env ]]; then
  echo "Ошибка: нет services/laravel-app/.env" >&2
  echo "Создайте один раз: cp services/laravel-app/.env.example services/laravel-app/.env && nano services/laravel-app/.env" >&2
  exit 1
fi

if [[ -d .git ]]; then
  echo "==> backend: git pull --ff-only ($BRANCH)"
  git pull --ff-only origin "$BRANCH" || git pull --ff-only
else
  echo "Предупреждение: в $BACKEND_ROOT нет .git — пропуск git pull." >&2
  echo "  Восстановите репозиторий: git clone https://github.com/lindrosss/vameo-backend.git . (сохраните .env в сторону перед заменой каталога)" >&2
fi

if [[ -d "$FRONTEND_ROOT/.git" ]]; then
  echo "==> frontend: git pull --ff-only ($BRANCH) → $FRONTEND_ROOT"
  git -C "$FRONTEND_ROOT" pull --ff-only origin "$BRANCH" || git -C "$FRONTEND_ROOT" pull --ff-only
elif [[ -d "$FRONTEND_ROOT" ]]; then
  echo "Предупреждение: $FRONTEND_ROOT без .git — сборка фронта из текущих файлов на диске." >&2
fi

echo "==> docker compose build && up -d"
docker compose build --pull
docker compose up -d

echo "==> каталоги кеша Laravel (на сервере bootstrap/cache может отсутствовать — он в .gitignore без заглушки)"
docker compose exec -T -u root laravel-app sh -c \
  'mkdir -p /var/www/html/bootstrap/cache /var/www/html/storage/framework/{cache/data,sessions,views,testing} /var/www/html/storage/logs /var/www/html/storage/app/public'

echo "==> composer install (от root: иначе www-data не может создать vendor на bind-mount с хоста)"
if grep -q '^APP_ENV=production' services/laravel-app/.env 2>/dev/null; then
  docker compose exec -T -u root laravel-app sh -c \
    'composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader && chown -R www-data:www-data /var/www/html/vendor /var/www/html/bootstrap/cache /var/www/html/storage'
else
  docker compose exec -T -u root laravel-app sh -c \
    'composer install --no-interaction --prefer-dist && chown -R www-data:www-data /var/www/html/vendor /var/www/html/bootstrap/cache /var/www/html/storage'
fi

echo "==> php artisan migrate --force"
docker compose exec -T laravel-app php artisan migrate --force

if grep -q '^APP_ENV=production' services/laravel-app/.env 2>/dev/null; then
  echo "==> production: config:cache, route:cache"
  docker compose exec -T laravel-app php artisan config:cache
  docker compose exec -T laravel-app php artisan route:cache || true
fi

echo "==> готово. Проверка: curl -sS http://127.0.0.1:80/api/health (или порт из VAMEO_NGINX_HTTP_PORT в .env у compose)"
