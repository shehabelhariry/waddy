#!/usr/bin/env bash
# Package the Waddy extension into waddy-extension.zip for the Chrome Web Store.
# Builds the popup, then zips only the runtime files (no src / node_modules / .env).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo "→ Building popup…"
( cd popup && npm run build )

echo "→ Packaging…"
rm -f waddy-extension.zip
zip -rq waddy-extension.zip \
  manifest.json \
  background.js \
  content.js \
  small_logo.png \
  popup/dist

echo "✓ Created waddy-extension.zip ($(du -h waddy-extension.zip | cut -f1))"
echo "  Remember to bump \"version\" in manifest.json before uploading a new build."
