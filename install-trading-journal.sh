#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

echo "Trading Journal installer"
echo
echo "This installs project dependencies and sets up a local database inside this folder."
echo "It does not install anything globally."
echo

if ! command -v npm >/dev/null 2>&1; then
  echo "npm was not found. Install Node.js 20 or newer first, then run this script again."
  exit 1
fi

npm install
npm run setup:local

echo
echo "Starting Trading Journal locally..."
npm run dev
