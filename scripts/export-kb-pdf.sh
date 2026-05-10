#!/usr/bin/env bash
# Regenerate PDF exports (wrapper). Prefer: npm install && npm run kb-pdf
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm install --silent
npm run kb-pdf --silent
