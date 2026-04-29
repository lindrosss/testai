# Vameo — React frontend

SPA для сервиса учёта групповых расходов. Общается с Laravel API (`/api`) по HTTPS с CORS и Sanctum CSRF cookie при мутациях.

Docker-образ публикуется как **`ghcr.io/lindrosss/frontend-vameo:latest`**. Отдельный стек: **`docker-compose.yml`** в этом репозитории (проект в Docker Desktop: **`frontend-vameo`**), контейнер **`frontend-vameo`**.

## Требования

- Node.js 18+
- Запущенный бэкенд Vameo (Docker Compose), nginx API обычно **`http://localhost:8080/api`**

## Установка

```bash
npm install
```

## Переменные окружения

Скопируйте `.env.example` в `.env` и при необходимости измените:

| Переменная        | Описание |
|-------------------|----------|
| `VITE_API_URL`    | По умолчанию не задан → **`/api`** (тот же origin). В Docker nginx фронта проксирует `/api` и `/sanctum` на бэкенд `:8080`. Для CDN без своего nginx задайте полный URL. |
| `VITE_PROXY_TARGET` | Только dev: куда Vite проксирует `/api` и `/sanctum` (по умолчанию `http://localhost:8080`). |

На **бэкенде** Laravel переменная **`FRONTEND_URL`** (см. `config('app.frontend_url')`) должна совпадать с публичным URL этого SPA — от неё строятся ссылки из писем: сброс пароля (`/reset-password?token=…&email=…`) и приглашения (`/?invite=…`).

## Разработка

```bash
npm run dev
```

Приложение: [http://localhost:5173](http://localhost:5173). Vite проксирует `/api` и `/sanctum` на `VITE_PROXY_TARGET`. Имя Docker-образа на dev-сервер не влияет.

## Сборка

```bash
npm run build
```

Артефакты в `dist/`.

## Docker (локальная сборка и публикация)

Сборка и теги в стиле **`frontend-vameo`**:

```bash
docker build -t frontend-vameo:latest .
docker tag frontend-vameo:latest ghcr.io/lindrosss/frontend-vameo:latest
docker push ghcr.io/lindrosss/frontend-vameo:latest
```

Образ с другим `VITE_API_URL` при сборке:

```bash
docker build --build-arg VITE_API_URL=https://api.example.com/api -t frontend-vameo:latest .
```

Запуск контейнера вручную (после `docker pull`):

```bash
docker pull ghcr.io/lindrosss/frontend-vameo:latest
docker run -d -p 3000:80 --add-host=host.docker.internal:host-gateway --name frontend-vameo ghcr.io/lindrosss/frontend-vameo:latest
```

Проверка:

```bash
docker ps | grep frontend-vameo
docker logs frontend-vameo
curl -I http://localhost:3000
```

## Docker Compose (этот репозиторий)

Фронт — **отдельный проект** в Docker Desktop (`name: frontend-vameo`), не смешивается со стеком `backend`. Бэкенд поднимайте из репозитория [vameo-backend](https://github.com/lindrosss/vameo-backend) отдельно.

```bash
cd /path/to/vameo-frontend-react
# при необходимости: cp .env.example .env и поправьте VITE_API_URL / FRONTEND_PORT
docker compose build
docker compose up -d
```

Образ из GHCR (без локальной сборки), если есть доступ к реестру:

```bash
docker compose pull
docker compose up -d
```

Перезапуск:

```bash
docker compose down && docker compose up -d
```

Статика: [http://localhost:3000](http://localhost:3000). Запросы **`/api`** и **`/sanctum`** nginx контейнера проксирует на **`host.docker.internal:8080`** (тот же порт, что `VAMEO_NGINX_HTTP_PORT` в бэкенде). Браузеру не нужен прямой доступ к `:8080`.

## CI/CD

Workflow **`.github/workflows/docker-build.yml`** собирает образ и пушит **`ghcr.io/lindrosss/frontend-vameo:latest`** (`IMAGE_NAME: frontend-vameo`).

## Скрипты

| Команда       | Действие        |
|---------------|-----------------|
| `npm run dev` | Dev-сервер Vite |
| `npm run build` | Production bundle |
| `npm run preview` | Локальный просмотр `dist` |
