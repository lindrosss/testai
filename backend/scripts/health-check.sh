#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== Laravel /api/test/health =="
curl -sfS "http://localhost/api/test/health" || { echo "FAIL: Laravel health"; exit 1; }
echo ""

echo "== PostgreSQL pg_isready =="
docker compose exec -T postgres pg_isready -U vameo_user -d vameo_db

echo "== Redis PING =="
docker compose exec -T redis redis-cli PING

echo "== RabbitMQ diagnostics =="
docker compose exec -T rabbitmq rabbitmq-diagnostics ping

echo "All checks passed."
