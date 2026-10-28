#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
APP_JSON="$FRONTEND_DIR/app.json"
DIST_DIR="$FRONTEND_DIR/dist"
APK_SOURCE="$FRONTEND_DIR/android/app/build/outputs/apk/release/app-release.apk"
APK_DEST="$DIST_DIR/manamano.apk"

BUMP=""

usage() {
  cat <<EOF
Uso: $0 [--bump <major|minor|patch>]

Gera o APK Android localmente e o salva em frontend/dist/manamano.apk.

Sem --bump, nenhum bump é aplicado e a versão atual é mantida.
Com --bump, atualiza expo.version e incrementa android.versionCode.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bump)
      if [[ $# -lt 2 ]]; then
        echo "Informe o tipo de bump: major, minor ou patch." >&2
        exit 1
      fi
      BUMP="$2"
      shift 2
      ;;
    --bump=*)
      BUMP="${1#*=}"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Argumento inválido: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -n "$BUMP" && ! "$BUMP" =~ ^(major|minor|patch)$ ]]; then
  echo "Bump inválido: $BUMP. Use major, minor ou patch." >&2
  exit 1
fi

VERSION_INFO=$(node - "$APP_JSON" "$BUMP" <<'NODE'
const fs = require('fs');

const [, , appJsonPath, bump] = process.argv;
const file = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const { expo } = file;

if (!expo || typeof expo.version !== 'string') {
  console.error('frontend/app.json não possui expo.version.');
  process.exit(1);
}

const parts = expo.version.split('.');

if (parts.length !== 3 || parts.some((part) => !/^\d+$/.test(part))) {
  console.error(`Versão inválida em expo.version: ${expo.version}`);
  process.exit(1);
}

let [major, minor, patch] = parts.map(Number);

if (bump === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (bump === 'minor') {
  minor += 1;
  patch = 0;
} else if (bump === 'patch') {
  patch += 1;
}

expo.version = `${major}.${minor}.${patch}`;

const android = expo.android ?? {};
const currentVersionCode = Number.isInteger(android.versionCode) ? android.versionCode : 0;

if (bump) {
  android.versionCode = currentVersionCode + 1;
  expo.android = android;
  fs.writeFileSync(appJsonPath, `${JSON.stringify(file, null, 2)}\n`);
} else {
  android.versionCode = currentVersionCode;
}

process.stdout.write(`${expo.version} ${android.versionCode}`);
NODE
)

read -r VERSION VERSION_CODE <<< "$VERSION_INFO"

echo "Gerando APK da versão $VERSION (versionCode $VERSION_CODE)..."

(cd "$FRONTEND_DIR" && npm run build:android)

if [[ ! -f "$APK_SOURCE" ]]; then
  echo "APK não encontrado em $APK_SOURCE." >&2
  exit 1
fi

mkdir -p "$DIST_DIR"
cp "$APK_SOURCE" "$APK_DEST"

echo ""
echo "Build concluído."
echo "Versão: $VERSION (versionCode $VERSION_CODE)"
echo "APK: $APK_DEST"
echo ""
echo "Próximos passos:"

if [[ -n "$BUMP" ]]; then
  echo "1. Revise e commite as alterações em frontend/app.json e no projeto Android."
else
  echo "1. A versão atual foi mantida; use --bump para incrementá-la antes de publicar."
fi

echo "2. Crie a GitHub Release com a tag $VERSION."
echo "3. Anexe o APK como manamano.apk."
echo "4. Use docs/release-template.md para as notas."
