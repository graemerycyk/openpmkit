---
name: crawler-news
description: Track industry news and press releases for market intelligence
metadata: {"pmkit":{"emoji":"📰","category":"crawlers","schedule":"manual"}}
---

# News Crawler

Track industry news, press releases, and publications for market intelligence and competitive awareness.

## Overview

The News Crawler monitors news sources to help PMs:
- Track competitor announcements and funding news
- Monitor industry trends and market shifts
- Discover customer-facing press coverage
- Stay informed on regulatory changes

## News Sources

| Provider | Method | Free Tier | Notes |
|----------|--------|-----------|-------|
| NewsAPI.org | Official API | 100/day | Best coverage |
| GNews | Official API | 100/day | Alternative |
| Google News RSS | RSS feed | Unlimited | Fallback |

## Tools

### crawl_news

Search news sources for keywords.

**Input:**
```json
{
  "keywords": ["product management", "SaaS funding"],
  "limit": 25,
  "language": "en",
  "sortBy": "publishedAt"
}
```

**Output:** Array of news articles with:
- Headline and description
- Source publication
- Author (if available)
- Published date
- URL

### get_competitor_news

Track news about specific competitors.

**Input:**
```json
{
  "competitors": ["Notion", "Coda", "Monday.com"],
  "days": 7
}
```

**Output:** News articles mentioning competitors, sorted by relevance.

## Example Usage

```bash
# Track industry news
pmkit crawler news --keywords "product management software" "SaaS tools"

# Monitor competitor news
pmkit crawler news --keywords "Notion funding" "Coda raises" --sortBy publishedAt

# Get latest industry headlines
pmkit crawler news --keywords "enterprise software" --limit 50 --sortBy popularity
```

## Environment Variables

```bash
# One of these recommended (100 free queries/day)
NEWSAPI_KEY=...   # Get from newsapi.org
GNEWS_API_KEY=... # Get from gnews.io
```

If no API key is set, falls back to Google News RSS (unlimited but less structured).

## Output

Results saved to: `pmkit/crawler-news/{timestamp}/results.json`
Analysis saved to: `pmkit/crawler-news/{timestamp}/analysis.md`
Telemetry saved to: `pmkit/crawler-news/{timestamp}/telemetry.json`

## Use Cases

### Competitive Intelligence
```bash
pmkit crawler news --keywords "competitor raises funding" "competitor acquisition"
```

### Industry Monitoring
```bash
pmkit crawler news --keywords "product management trends" "PM tools 2026"
```

### Press Coverage
```bash
pmkit crawler news --keywords "your company name" --sortBy publishedAt
```

## Schedule

For automated news monitoring, set up a schedule:
```bash
pmkit scheduler set-schedule crawler-news "0 8 * * *"  # Daily at 8am
```
