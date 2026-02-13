#!/usr/bin/env bash
# Build the OpenPMKit plugin zip for manual installation.
# Usage: bash scripts/package_plugin.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_DIR="$REPO_ROOT/plugin"
OUTPUT="$REPO_ROOT/openpmkit.zip"
BUILD_DIR="/tmp/openpmkit-build"

# Clean up old artifacts
rm -f "$OUTPUT"
rm -rf "$BUILD_DIR"

# Copy plugin contents into openpmkit/ wrapper directory
mkdir -p "$BUILD_DIR/openpmkit"
cp -r "$PLUGIN_DIR"/.claude-plugin "$BUILD_DIR/openpmkit/"
cp -r "$PLUGIN_DIR"/commands "$BUILD_DIR/openpmkit/"
cp -r "$PLUGIN_DIR"/skills "$BUILD_DIR/openpmkit/"
cp -f "$PLUGIN_DIR"/README.md "$BUILD_DIR/openpmkit/"
[ -f "$PLUGIN_DIR"/CONNECTORS.md ] && cp -f "$PLUGIN_DIR"/CONNECTORS.md "$BUILD_DIR/openpmkit/"
[ -f "$PLUGIN_DIR"/.mcp.json ] && cp -f "$PLUGIN_DIR"/.mcp.json "$BUILD_DIR/openpmkit/"
[ -f "$PLUGIN_DIR"/LICENSE ] && cp -f "$PLUGIN_DIR"/LICENSE "$BUILD_DIR/openpmkit/"

# Build zip
cd "$BUILD_DIR"
zip -r "$OUTPUT" openpmkit/ \
  --exclude '*.DS_Store' \
  --exclude '*__pycache__*' \
  --exclude '*.pyc'

# Clean up
rm -rf "$BUILD_DIR"

echo ""
echo "Built: $OUTPUT"
echo "Files: $(unzip -l "$OUTPUT" | grep -c 'openpmkit/')"
