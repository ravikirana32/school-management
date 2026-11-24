#!/usr/bin/env bash
set -euo pipefail
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.prod}"
HEALTH_URL="${HEALTH_URL:?Set HEALTH_URL to the public API readiness endpoint}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
[[ "$IMAGE_TAG" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]{0,127}$ ]] || { echo "Invalid IMAGE_TAG" >&2; exit 1; }
[[ "$HEALTH_URL" =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?/health/ready$ ]] || { echo "HEALTH_URL must be a public HTTPS /health/ready URL" >&2; exit 1; }
export IMAGE_TAG
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

echo "[deploy] Pull immutable images for tag $IMAGE_TAG"
compose pull
echo "[deploy] Create encrypted pre-deploy PostgreSQL backup"
compose --profile ops run --rm backup-postgres
echo "[deploy] Apply database migrations"
compose run --rm migrate
echo "[deploy] Start/replace services"
compose up -d --remove-orphans

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error "$HEALTH_URL" >/dev/null; then
    echo "[deploy] API readiness passed"
    compose ps
    exit 0
  fi
  sleep 10
done
echo "[deploy] API did not become ready; deployment is not accepted." >&2
compose ps
exit 1
