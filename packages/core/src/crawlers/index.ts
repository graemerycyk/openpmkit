/**
 * AI Crawlers - Real implementations for web data collection
 *
 * These crawlers use free-tier APIs to fetch real data:
 * - Social Crawler: Reddit API (official, free)
 * - Web Search: Serper.dev (2,500 free queries)
 * - News Crawler: NewsAPI.org (100 req/day dev tier)
 * - URL Scrape: Direct fetch (no API needed)
 */

export * from './social';
export * from './web-search';
export * from './news';
export * from './url-scrape';
export * from './types';
