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

# npx expo prebuild

# eas build \
#   --platform android \
#   --profile preview \
#   --non-interactive

# echo "Fetching latest APK URL..."

# APK_URL=$(eas build:list \
#   --json \
#   --limit 1 \
#   --non-interactive \
#   2>/dev/null \
#   | jq -r '.[0].artifacts.applicationArchiveUrl')

# echo "Downloading APK..."

# mkdir -p "$NGINX_DOWNLOADS_DIR"

# curl -L "$APK_URL" \
#   -o "$NGINX_DOWNLOADS_DIR/app.apk"

# echo "Build complete!"
# echo "APK saved to:"
# echo "$NGINX_DOWNLOADS_DIR/app.apk"

echo "Registering version in backend..."

# Version infos
BUILD_JSON=$(eas build:list --json --limit 1 --non-interactive)

EAS_BUILD_ID=$(echo "$BUILD_JSON" | jq -r '.[0].id')
BUILD=$(echo "$BUILD_JSON" | jq -r '.[0].appBuildVersion')
VERSION=$(echo "$BUILD_JSON" | jq -r '.[0].appVersion')

echo "Sending request..."

curl -X POST http://localhost:3000/app/version \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": \"$VERSION\",
    \"build\": $BUILD,
    \"easBuildId\": \"$EAS_BUILD_ID\",
    \"mandatory\": false
  }"