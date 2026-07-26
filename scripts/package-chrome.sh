#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Building extension..."
npm run build

echo "Preparing Chrome build..."
rm -rf dist-chrome
cp -r dist dist-chrome

echo "Removing Firefox-specific settings from manifest..."
node -e "
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync('dist-chrome/manifest.json', 'utf8'));
delete manifest.browser_specific_settings;
fs.writeFileSync('dist-chrome/manifest.json', JSON.stringify(manifest, null, 2));
"

echo "Creating Chrome zip..."
cd dist-chrome
zip -r -FS ../tabnest-chrome.zip .
cd ..

echo "Cleaning up..."
rm -rf dist-chrome

echo "Done: tabnest-chrome.zip"
