#!/bin/sh
# Wait until TCP host:port accepts connections, then exec the remaining command.
set -e

host="${1:?host required}"
port="${2:?port required}"
shift 2

if [ "${1:-}" = "--" ]; then
  shift
fi

echo "Waiting for ${host}:${port}..."
while ! nc -z "$host" "$port" 2>/dev/null; do
  sleep 1
done
echo "${host}:${port} is available."

exec "$@"
