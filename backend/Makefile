.PHONY: up down build logs shell worker-logs restart clean health composer-install

COMPOSE := docker compose
# Каталог backend/ (где лежит этот Makefile и docker-compose.yml)
PROJECT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))

up:
	cd $(PROJECT) && $(COMPOSE) up -d

down:
	cd $(PROJECT) && $(COMPOSE) down

build:
	cd $(PROJECT) && $(COMPOSE) build

logs:
	cd $(PROJECT) && $(COMPOSE) logs -f

shell:
	cd $(PROJECT) && $(COMPOSE) exec laravel-app sh

worker-logs:
	cd $(PROJECT) && $(COMPOSE) logs -f go-worker

restart:
	cd $(PROJECT) && $(COMPOSE) restart

clean:
	cd $(PROJECT) && $(COMPOSE) down -v --rmi local

health:
	cd $(PROJECT) && ./scripts/health-check.sh

# Зависимости PHP в смонтированный каталог (нужны для artisan и nginx). После docker compose up -d.
composer-install:
	cd $(PROJECT) && $(COMPOSE) exec laravel-app composer install --no-interaction --prefer-dist --ignore-platform-req=ext-sockets
