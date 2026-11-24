#!/usr/bin/env bash
set -euo pipefail
umask 077
SECRETS_DIR="${SECRETS_DIR:-./secrets}"
POSTGRES_USER="${POSTGRES_USER:-school_saas}"
POSTGRES_DB="${POSTGRES_DB:-school_saas}"
mkdir -p "$SECRETS_DIR"
chmod 700 "$SECRETS_DIR"
for name in postgres_password redis_password database_url redis_url jwt_access_secret jwt_refresh_secret platform_secret_key parent_invite_key metrics_token suppression_hash_current grafana_admin_password backup_age_identity.txt backup_age_recipient.txt backup_age_keygen.log suppression_hash_previous document_scan_webhook_secret parent_email_provider_token notification_email_provider_token notification_email_webhook_secret document_scanner_provider_token s3_access_key_id s3_secret_access_key; do
  if [[ -e "$SECRETS_DIR/$name" ]]; then
    echo "Refusing to overwrite existing secret: $SECRETS_DIR/$name" >&2
    exit 1
  fi
done
require() { command -v "$1" >/dev/null 2>&1 || { echo "Required command not found: $1" >&2; exit 1; }; }
require openssl
require age-keygen
postgres_password="$(openssl rand -hex 24)"
redis_password="$(openssl rand -hex 24)"
printf '%s' "$postgres_password" > "$SECRETS_DIR/postgres_password"
printf '%s' "$redis_password" > "$SECRETS_DIR/redis_password"
printf 'postgresql://%s:%s@postgres:5432/%s?schema=public' "$POSTGRES_USER" "$postgres_password" "$POSTGRES_DB" > "$SECRETS_DIR/database_url"
printf 'redis://:%s@redis:6379/0' "$redis_password" > "$SECRETS_DIR/redis_url"
openssl rand -hex 48 > "$SECRETS_DIR/jwt_access_secret"
openssl rand -hex 48 > "$SECRETS_DIR/jwt_refresh_secret"
openssl rand -hex 32 > "$SECRETS_DIR/platform_secret_key"
openssl rand -base64 32 > "$SECRETS_DIR/parent_invite_key"
openssl rand -hex 48 > "$SECRETS_DIR/metrics_token"
openssl rand -hex 48 > "$SECRETS_DIR/suppression_hash_current"
openssl rand -hex 24 > "$SECRETS_DIR/grafana_admin_password"
: > "$SECRETS_DIR/suppression_hash_previous"
: > "$SECRETS_DIR/document_scan_webhook_secret"
: > "$SECRETS_DIR/parent_email_provider_token"
: > "$SECRETS_DIR/notification_email_provider_token"
: > "$SECRETS_DIR/notification_email_webhook_secret"
: > "$SECRETS_DIR/document_scanner_provider_token"
: > "$SECRETS_DIR/s3_access_key_id"
: > "$SECRETS_DIR/s3_secret_access_key"
age-keygen -o "$SECRETS_DIR/backup_age_identity.txt" 2> "$SECRETS_DIR/backup_age_keygen.log"
age-keygen -y "$SECRETS_DIR/backup_age_identity.txt" > "$SECRETS_DIR/backup_age_recipient.txt"
chmod 600 "$SECRETS_DIR"/*
echo "Secrets created in $SECRETS_DIR. Keep backup_age_identity.txt offline and never commit it."
echo "Set AGE_RECIPIENT=$(cat "$SECRETS_DIR/backup_age_recipient.txt") in .env.prod."
echo "Create .env.prod from .env.prod.example and set SECRETS_DIR=$SECRETS_DIR."
