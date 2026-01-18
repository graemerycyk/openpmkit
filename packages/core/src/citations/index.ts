/**
 * @module citations
 *
 * Unified citation system for tracking sources across multiple connectors.
 * Supports registering sources from any fetcher and generating citations.
 *
 * @example
 * ```typescript
 * import { CitationTracker, SlackFormatter, GmailFormatter } from '@pmkit/core/citations';
 *
 * const tracker = new CitationTracker();
 * tracker.registerFormatter(new SlackFormatter());
 * tracker.registerFormatter(new GmailFormatter());
 *
 * // Register sources from fetched items
 * for (const item of slackItems) {
 *   tracker.register(item, item.metadata.permalink);
 * }
 *
 * // Generate sources section for artifact
 * const markdown = tracker.generateSourcesMarkdown();
 * ```
 */

// Types
export type {
  CitableSource,
  CitationContext,
  ICitationTracker,
  ISourceFormatter,
  SourceRecord,
} from './types';

// Implementation
export { CitationTracker } from './citation-tracker';

// Formatters will be exported as they are created
// export { SlackFormatter } from './formatters/slack-formatter';
// export { GmailFormatter } from './formatters/gmail-formatter';
// export { CalendarFormatter } from './formatters/calendar-formatter';
