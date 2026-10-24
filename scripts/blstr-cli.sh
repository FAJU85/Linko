#!/usr/bin/env bash
# blstrco Developer CLI Utility
# Organization: blstrco (Linktree Infrastructure & Engineering)

set -e

HOST="${OMNILINK_HOST:-http://localhost:3000}"

echo "=================================================="
echo "⚡ blstrco Enterprise CLI Tool v2026.4"
echo "Target Host: $HOST"
echo "=================================================="

case "$1" in
  health)
    echo "🔍 Querying /healthz telemetry..."
    curl -s "$HOST/healthz" | jq .
    ;;
  flags)
    echo "🚩 Fetching dynamic feature flags..."
    curl -s "$HOST/api/v1/flags" | jq .
    ;;
  purge)
    KEY="${2:-profile-alexrivera}"
    echo "🧹 Dispathing edge cache purge for surrogate key '$KEY'..."
    curl -s -X POST "$HOST/api/v1/edge/purge" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer blstr_dev_key" \
      -d "{\"surrogateKey\":\"$KEY\"}" | jq .
    ;;
  docs)
    echo "📄 Fetching OpenAPI spec..."
    curl -s "$HOST/api/v1/docs" | jq .
    ;;
  logs)
    echo "📊 Fetching OpenTelemetry logs..."
    curl -s "$HOST/api/v1/telemetry/logs" | jq .
    ;;
  *)
    echo "Usage: $0 {health|flags|purge [surrogateKey]|docs|logs}"
    exit 1
    ;;
esac
