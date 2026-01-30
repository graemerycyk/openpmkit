---
name: pm-release-notes
description: Generate customer-facing release notes from Jira and Confluence - clear, benefit-focused, ready to publish
metadata: {"pmkit":{"emoji":"📢","category":"documentation","schedule":"manual"}}
---

# Release Notes

Generate customer-facing release notes from Jira and Confluence; clear, benefit-focused, and ready to publish.

## Overview

Translate technical work into clear, benefit-focused release notes that customers, sales teams, and CSMs can understand and use.

## Tools

### generate_release_notes

Generate customer-facing release notes for a release.

**Input:**
```json
{
  "releaseVersion": "v2.4.0",
  "releaseDate": "2026-01-30",
  "productName": "Acme Platform",
  "fixVersionFilter": "2.4.0"
}
```

**Output:** Markdown release notes with:
- Highlights (top 2-3 most impactful changes with benefit statements)
- New features (new capabilities added)
- Improvements (enhancements to existing features)
- Bug fixes (issues resolved, grouped if many)
- Breaking changes (changes requiring customer action)
- Coming soon (brief preview of what's next)

For each item:
- Clear title
- 1-2 sentence description of the benefit to users
- Link reference placeholder

### get_completed_issues

Fetch completed Jira issues for the release.

**Input:**
```json
{
  "fixVersion": "2.4.0",
  "projectKey": "ACME"
}
```

### get_epic_summaries

Fetch epic descriptions for context.

**Input:**
```json
{
  "fixVersion": "2.4.0"
}
```

### get_related_prds

Fetch related PRDs from Confluence.

**Input:**
```json
{
  "fixVersion": "2.4.0",
  "spaceKey": "PRODUCT"
}
```

### get_previous_release_notes

Fetch previous release notes for format reference.

**Input:**
```json
{
  "productName": "Acme Platform",
  "limit": 3
}
```

## Schedule

Default: Manual trigger only (run before each release)

## Output

Markdown file saved to: `pmkit/release-notes/{timestamp}/{version}.md`

SIEM telemetry saved to: `pmkit/release-notes/{timestamp}/telemetry.json`
