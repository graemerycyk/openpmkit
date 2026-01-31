---
name: pm-prototype
description: Turn PRDs into interactive HTML prototypes with working UI - validate ideas in minutes, not weeks
metadata: {"pmkit":{"emoji":"🎨","category":"design","schedule":"manual"}}
---

# PRD to Prototype

Turn PRDs into interactive HTML prototypes with working UI - validate ideas in minutes, not weeks.

## Overview

Generate interactive HTML prototypes from PRD documents that can be opened directly in a browser.

## Tools

### generate_prototype

Generate an interactive HTML prototype from a PRD.

**Input:**
```json
{
  "prdPath": "pmkit/prd-draft/2026-01-30/search-filters.md",
  "focusAreas": ["filter_bar", "results_list", "date_picker"],
  "designStyle": "modern"
}
```

**Output:** Complete standalone HTML file with:
- Embedded CSS (flexbox, grid, CSS variables)
- Interactive elements (dropdowns, buttons, filters)
- Vanilla JavaScript for interactivity
- Realistic placeholder data
- Mobile-responsive layout

Design style options:
- `modern` - Indigo/blue primary, gray neutrals, subtle shadows
- `minimal` - Black/white, clean typography, lots of whitespace
- `corporate` - Blue/gray, professional, enterprise feel

### read_prd

Read a PRD file for prototype generation.

**Input:**
```json
{
  "prdPath": "pmkit/prd-draft/2026-01-30/search-filters.md"
}
```

### get_design_system

Fetch design system guidelines.

**Input:**
```json
{
  "system": "default",
  "components": ["buttons", "forms", "cards", "navigation"]
}
```

## Schedule

Default: Manual trigger only

## Output

HTML file saved to: `pmkit/prototype/{timestamp}/{feature-name}.html`

SIEM telemetry saved to: `pmkit/prototype/{timestamp}/telemetry.json`
