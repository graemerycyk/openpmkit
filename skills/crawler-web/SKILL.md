---
name: crawler-web
description: Search Google and Bing for competitor intelligence and market research
metadata: {"pmkit":{"emoji":"🔍","category":"crawlers","schedule":"manual"}}
---

# Web Search Crawler

Search Google and Bing for competitor intelligence, pricing pages, feature announcements, and market research.

## Overview

The Web Search Crawler performs automated web searches to help PMs:
- Track competitor product changes and announcements
- Find pricing information and comparisons
- Research market trends and industry news
- Discover customer discussions and reviews

## Search Providers

| Provider | Method | Free Tier | Notes |
|----------|--------|-----------|-------|
| Serper.dev | Google results | 2,500/month | Best quality |
| DuckDuckGo | Instant answers | Unlimited | Fallback, limited |

## Tools

### crawl_web

Search the web for specific keywords.

**Input:**
```json
{
  "keywords": ["competitor pricing", "product roadmap 2026"],
  "limit": 20,
  "searchType": "web"
}
```

**Output:** Array of search results with:
- Title and snippet
- URL
- Position in results
- Date (if available)

### crawl_competitor_pages

Fetch and analyze specific competitor URLs.

**Input:**
```json
{
  "urls": [
    "https://competitor.com/pricing",
    "https://competitor.com/features",
    "https://competitor.com/changelog"
  ]
}
```

**Output:** Extracted page content including:
- Title and description
- Main content text
- Metadata (author, date, etc.)

## Example Usage

```bash
# Search for competitor pricing
pmkit crawler web --keywords "Notion pricing 2026"

# Track competitor product updates
pmkit crawler web --keywords "Coda new features" "Monday.com update"

# Analyze competitor pricing pages
pmkit crawler urls --urls https://notion.so/pricing https://coda.io/pricing
```

## Environment Variables

```bash
# Recommended - much better results
SERPER_API_KEY=...  # Get from serper.dev (2,500 free queries/month)
```

## Output

Results saved to: `pmkit/crawler-web/{timestamp}/results.json`
Analysis saved to: `pmkit/crawler-web/{timestamp}/analysis.md`
Telemetry saved to: `pmkit/crawler-web/{timestamp}/telemetry.json`

## Use Cases

### Competitive Research
```bash
pmkit crawler web --keywords "competitor vs alternative" --limit 30
```

### Pricing Intelligence
```bash
pmkit crawler urls --urls https://competitor1.com/pricing https://competitor2.com/pricing
```

### Feature Tracking
```bash
pmkit crawler web --keywords "competitor changelog" "competitor new feature"
```
