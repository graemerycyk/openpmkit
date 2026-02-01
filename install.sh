#!/bin/bash

# openpmkit Plugin Installer
# Installs PM workflow skills for Claude Code

set -e

REPO_URL="https://github.com/graemerycyk/openpmkit"
SKILLS_DIR="$HOME/.claude/skills"
TEMP_DIR=$(mktemp -d)

echo "================================================"
echo "  openpmkit Plugin Installer"
echo "  AI-powered PM workflows for Claude Code"
echo "================================================"
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "Error: git is required but not installed."
    exit 1
fi

# Create skills directory if it doesn't exist
if [ ! -d "$SKILLS_DIR" ]; then
    echo "Creating Claude skills directory..."
    mkdir -p "$SKILLS_DIR"
fi

# Clone the repo
echo "Downloading openpmkit..."
git clone --depth 1 --quiet "$REPO_URL" "$TEMP_DIR/openpmkit"

# Copy skills
echo "Installing skills..."
cp -r "$TEMP_DIR/openpmkit/plugin/skills/"* "$SKILLS_DIR/"

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Available commands:"
echo "  /pmkit-help      - Show all available commands"
echo "  /daily-brief     - Morning context summary"
echo "  /meeting-prep    - Pre-meeting research pack"
echo "  /feature-intel   - Voice of Customer clustering"
echo "  /prd-draft       - Generate a PRD"
echo "  /sprint-review   - Sprint summary with metrics"
echo "  /competitor      - Competitor intelligence"
echo "  /roadmap         - Alignment memo with options"
echo "  /release-notes   - Customer-facing release notes"
echo "  /deck-content    - Slide content for any audience"
echo "  /prototype       - Interactive HTML prototype"
echo ""
echo "Restart Claude Code to use the new skills."
echo ""
