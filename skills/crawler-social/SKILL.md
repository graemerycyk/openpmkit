---
name: crawler-social
description: Monitor social platforms for product mentions, competitor intel, and community sentiment
metadata: {"pmkit":{"emoji":"📱","category":"crawlers","schedule":"manual"}}
---

# Social Crawler

Monitor X, Reddit, LinkedIn, Discord, Bluesky, Threads, and Hacker News for product mentions, competitor intelligence, and community sentiment.

## Overview

The Social Crawler fetches and analyzes public posts across multiple social platforms to help PMs understand:
- How customers talk about their product
- What competitors are doing
- Community sentiment and feature requests
- Emerging trends and discussions

## Supported Platforms

| Platform | Method | Auth Required | Rate Limits |
|----------|--------|---------------|-------------|
| Reddit | Official API | No | 100 req/min |
| Hacker News | Algolia API | No | Unlimited |
| X (Twitter) | Nitter scraping | No | Best effort |
| Bluesky | AT Protocol | No | Standard |
| LinkedIn | Site search | No | Limited |
| Discord | Server search | No | Limited |
| Threads | Site search | No | Limited |

## Tools

### crawl_social

Search across social platforms for keywords and competitors.

**Input:**
```json
{
  "keywords": ["product name", "competitor", "feature request"],
  "platforms": ["reddit", "hackernews", "x", "bluesky"],
  "limit": 50,
  "timeRange": "week",
  "competitors": ["Notion", "Coda", "Monday.com"]
}
```

**Output:** Array of social posts with:
- Title and content
- Author and platform
- Engagement metrics (likes, comments, shares)
- URL for follow-up
- Timestamp

### analyze_social_results

Generate AI-powered analysis of crawl results.

**Input:**
```json
{
  "results": "<crawler_output>",
  "focusArea": "competitive"
}
```

**Output:** Structured analysis including:
- Executive summary
- Key themes with mention counts
- Sentiment breakdown
- Competitive insights
- Actionable recommendations

## Example Usage

```bash
# Search Reddit and HN for product mentions
pmkit crawler social --keywords "pmkit,product management" --platforms reddit,hackernews

# Monitor competitor mentions across all platforms
pmkit crawler social --keywords "Notion vs" --platforms reddit,x,bluesky --competitors Notion,Coda

# Weekly competitive analysis
pmkit crawler social --keywords "project management tool" --timeRange week --analyze
```

## Environment Variables

```bash
# Optional - enhances results but not required
REDDIT_CLIENT_ID=...     # For authenticated Reddit API
REDDIT_CLIENT_SECRET=...
```

## Output

Results saved to: `pmkit/crawler-social/{timestamp}/results.json`
Analysis saved to: `pmkit/crawler-social/{timestamp}/analysis.md`
Telemetry saved to: `pmkit/crawler-social/{timestamp}/telemetry.json`

## Schedule

Default: Manual trigger only

For automated monitoring, set up a schedule:
```bash
pmkit scheduler set-schedule crawler-social "0 9 * * 1"  # Mondays 9am
```
