#!/usr/bin/env bash
# Restore a .dump file created by backup.sh (pg_dump -Fc) into vameo_db.
# By default stops Laravel + worker containers briefly so pg_restore can take locks.
#
# Usage:
#   ./docker/postgres/restore.sh path/to/vameo_db_....dump
#   ./docker/postgres/restore.sh --no-stop path/to/backup.dump
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONTAINER="${POSTGRES_CONTAINER:-vameo-postgres}"
STOP_CONTAINERS=1
LARAVEL="${LARAVEL_CONTAINER:-vameo-laravel}"
WORKER="${WORKER_CONTAINER:-vameo-worker}"

if [[ "${1:-}" == "--no-stop" ]]; then
  STOP_CONTAINERS=0
  shift
fi

if [[ $# -lt 1 ]] || [[ ! -f "$1" ]]; then
  echo "Usage: $0 [--no-stop] path/to/vameo_db_....dump" >&2
  exit 1
fi

dump="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "Container $CONTAINER is not running. Start postgres first." >&2
  exit 1
fi

restart_laravel=0
restart_worker=0
if [[ "$STOP_CONTAINERS" -eq 1 ]]; then
  if docker ps --format '{{.Names}}' | grep -qx "$LARAVEL"; then
    docker stop "$LARAVEL" >/dev/null
    restart_laravel=1
  fi
  if docker ps --format '{{.Names}}' | grep -qx "$WORKER"; then
    docker stop "$WORKER" >/dev/null
    restart_worker=1
  fi
fi

cleanup() {
  if [[ "$restart_laravel" -eq 1 ]]; then docker start "$LARAVEL" >/dev/null || true; fi
  if [[ "$restart_worker" -eq 1 ]]; then docker start "$WORKER" >/dev/null || true; fi
}
trap cleanup EXIT

echo "Restoring $dump into $CONTAINER (database vameo_db) …"
docker exec -i "$CONTAINER" pg_restore -U vameo_user -d vameo_db --clean --if-exists --no-owner <"$dump"
echo "Restore finished."
