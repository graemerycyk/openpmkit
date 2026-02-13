#!/bin/bash
# Package OpenPMKit as a Claude Cowork plugin zip.
#
# Usage:
#   ./scripts/package_plugin.sh
#
# Produces: dist/openpmkit-v1.0.0.zip

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Step 1: Generate command files from the workflow registry
echo "Generating command files from workflow registry..."
python scripts/build_plugin.py

# Step 2: Count files
COMMAND_COUNT=$(ls -1 plugin/commands/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "Total command files: $COMMAND_COUNT"

# Step 3: Read version from plugin.json
VERSION=$(python -c "import json; print(json.load(open('plugin/.claude-plugin/plugin.json'))['version'])")
ZIP_NAME="openpmkit-v${VERSION}.zip"

# Step 4: Create zip with wrapper directory
# Cowork expects: openpmkit/.claude-plugin/plugin.json (not .claude-plugin/plugin.json at root)
mkdir -p dist
rm -f "dist/${ZIP_NAME}"
rm -rf dist/openpmkit
mkdir -p dist/openpmkit
cp -r plugin/.claude-plugin plugin/commands plugin/README.md dist/openpmkit/
cd dist
zip -r "${ZIP_NAME}" openpmkit/ -x "openpmkit/.DS_Store" "openpmkit/**/__pycache__/*"
rm -rf openpmkit
cd ..

echo ""
echo "Plugin packaged: dist/${ZIP_NAME}"
echo "Upload this file to Claude Cowork via Settings > Plugins > Upload from file"
