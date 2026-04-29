#!/usr/bin/env bash
# Dump vameo_db from the running Postgres container (custom format, pg_restore-compatible).
# Run from anywhere. Requires container name vameo-postgres (see docker-compose.yml).
#
# Typical flow before rebuild / down:
#   ./docker/postgres/backup.sh
#   docker compose build … && docker compose up -d
# If the named volume was recreated empty, restore:
#   ./docker/postgres/restore.sh docker/postgres/backups/vameo_db_YYYYMMDD_HHMMSS.dump
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_DIR="$SCRIPT_DIR/backups"
CONTAINER="${POSTGRES_CONTAINER:-vameo-postgres}"

if ! docker inspect "$CONTAINER" >/dev/null 2>&1; then
  echo "Container not found: $CONTAINER (set POSTGRES_CONTAINER if yours differs)" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Container $CONTAINER is not running. Start postgres first, e.g. from $BACKEND_DIR:" >&2
  echo "  docker compose up -d postgres" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
stamp="$(date +%Y%m%d_%H%M%S)"
out="$BACKUP_DIR/vameo_db_${stamp}.dump"

echo "Backing up to $out …"
docker exec "$CONTAINER" pg_dump -U vameo_user -d vameo_db -Fc --no-owner >"$out"
echo "Done: $out ($(wc -c <"$out" | tr -d ' ') bytes)"
