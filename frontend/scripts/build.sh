#!/bin/bash

set -e

# Diretório do script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# frontend/
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

# raiz do projeto
ROOT_DIR="$(dirname "$FRONTEND_DIR")"

# pasta onde o nginx vai servir os APKs
NGINX_DOWNLOADS_DIR="$ROOT_DIR/nginx/downloads"

echo "Starting Android build..."

cd "$FRONTEND_DIR"

# Gera/sincroniza android nativo
npx expo prebuild

echo "Starting EAS build..."

# Inicia build async
BUILD_JSON=$(eas build \
  --platform android \
  --profile preview \
  --non-interactive \
  --no-wait \
  --json)

# Pega ID do build
BUILD_ID=$(echo "$BUILD_JSON" | jq -r '.[0].id')

echo "Build started:"
echo "$BUILD_ID"

echo "Waiting for build to finish..."

while true; do
  BUILD_INFO=$(eas build:list \
    --json \
    --limit 1 \
    --non-interactive)

  CURRENT_ID=$(echo "$BUILD_INFO" | jq -r '.[0].id')
  STATUS=$(echo "$BUILD_INFO" | jq -r '.[0].status')

  # garante build correto
  if [ "$CURRENT_ID" != "$BUILD_ID" ]; then
    echo "Waiting for correct build..."
    sleep 15
    continue
  fi

  echo "Current status: $STATUS"

  if [ "$STATUS" = "FINISHED" ]; then
    echo "Build finished successfully!"
    break
  fi

  if [ "$STATUS" = "ERRORED" ] || [ "$STATUS" = "CANCELED" ]; then
    echo "Build failed."
    exit 1
  fi

  sleep 30
done

echo "Fetching APK URL..."

APK_URL=$(echo "$BUILD_INFO" \
  | jq -r '.[0].artifacts.applicationArchiveUrl')

mkdir -p "$NGINX_DOWNLOADS_DIR"

echo "Downloading APK..."

curl -L "$APK_URL" \
  -o "$NGINX_DOWNLOADS_DIR/app.apk"

echo "Build complete!"
echo "APK saved to:"
echo "$NGINX_DOWNLOADS_DIR/app.apk"

echo "Registering version in backend..."

BUILD=$(echo "$BUILD_INFO" \
  | jq -r '.[0].appBuildVersion')

VERSION=$(echo "$BUILD_INFO" \
  | jq -r '.[0].appVersion')

echo "Sending request..."

curl -X POST http://localhost:3000/app/version \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": \"$VERSION\",
    \"build\": $BUILD,
    \"easBuildId\": \"$BUILD_ID\",
    \"mandatory\": false
  }"

echo ""
echo "Done"