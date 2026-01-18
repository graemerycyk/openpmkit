import { decryptTokens, type OAuthTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  IFetcher,
  CalendarFetchOptions,
  CalendarEventMetadata,
} from './types';

// ============================================================================
// Internal Types for Google Calendar API Responses
// ============================================================================

interface CalendarApiEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  start?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end?: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    displayName?: string;
    email: string;
    responseStatus?: string;
    organizer?: boolean;
  }>;
  recurrence?: string[];
  hangoutLink?: string;
  conferenceData?: {
    entryPoints?: Array<{ uri?: string }>;
  };
  status?: string;
  organizer?: {
    displayName?: string;
    email: string;
  };
}

interface CalendarApiEventsResponse {
  items?: CalendarApiEvent[];
  nextPageToken?: string;
}

interface CalendarApiCalendar {
  id: string;
  summary: string;
  primary?: boolean;
}

interface CalendarApiCalendarsResponse {
  items?: CalendarApiCalendar[];
}

// ============================================================================
// Calendar Fetcher Implementation
// ============================================================================

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

/**
 * Fetcher for Google Calendar events.
 * Implements the IFetcher interface for use by any agent.
 *
 * @example
 * ```typescript
 * // Create from encrypted credentials
 * const fetcher = CalendarFetcher.fromEncrypted({
 *   encryptedBlob: '...',
 *   encryptionKey: '...',
 * });
 *
 * // Fetch upcoming events
 * const result = await fetcher.fetch({
 *   daysAhead: 1,
 *   calendarIds: ['primary'],
 * });
 *
 * // Process fetched items
 * for (const item of result.items) {
 *   console.log(`[${item.title}] ${item.content}`);
 * }
 * ```
 */
export class CalendarFetcher implements IFetcher<CalendarEventMetadata, CalendarFetchOptions> {
  readonly connector = 'google-calendar';
  readonly sourceTypes = ['calendar_event'] as const;

  private tokens: OAuthTokens;
  private calendarNameCache: Map<string, string> = new Map();

  constructor(tokens: OAuthTokens) {
    this.tokens = tokens;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): CalendarFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey);
    return new CalendarFetcher(tokens);
  }

  /**
   * Fetch events from Google Calendar.
   */
  async fetch(options: CalendarFetchOptions): Promise<FetchResult<CalendarEventMetadata>> {
    const startTime = Date.now();
    const {
      calendarIds = ['primary'],
      includePast = false,
      daysAhead = 1,
      limit = 50,
      onProgress,
    } = options;

    const items: FetchedItem<CalendarEventMetadata>[] = [];

    onProgress?.('Fetching Calendar events...');

    try {
      // Fetch calendar names for display
      await this.fetchCalendarNames();

      // Determine time range
      const now = new Date();
      let timeMin: Date;
      let timeMax: Date;

      if (includePast) {
        // For past events, use sinceHoursAgo
        const sinceHoursAgo = options.sinceHoursAgo ?? 24;
        timeMin = new Date(now.getTime() - sinceHoursAgo * 60 * 60 * 1000);
        timeMax = now;
      } else {
        // For future events, use daysAhead
        timeMin = now;
        timeMax = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      }

      // Fetch events from each calendar
      for (const calendarId of calendarIds) {
        const calendarName = this.calendarNameCache.get(calendarId) || calendarId;
        onProgress?.(`Fetching events from ${calendarName}...`);

        const calendarEvents = await this.fetchCalendarEvents(
          calendarId,
          timeMin,
          timeMax,
          limit
        );

        items.push(...calendarEvents);
        onProgress?.(`Found ${calendarEvents.length} events in ${calendarName}`);
      }

      // Sort by start time
      items.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      onProgress?.(`Fetched ${items.length} events from Calendar`);
    } catch (error) {
      onProgress?.(`Calendar fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }

    return {
      connector: this.connector,
      items: items.slice(0, limit),
      stats: {
        itemsProcessed: items.length,
        durationMs: Date.now() - startTime,
      },
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Fetch calendar names for display.
   */
  private async fetchCalendarNames(): Promise<void> {
    try {
      const response = await this.makeRequest<CalendarApiCalendarsResponse>(
        `${CALENDAR_API_BASE}/users/me/calendarList`
      );

      for (const calendar of response.items ?? []) {
        this.calendarNameCache.set(calendar.id, calendar.summary);
        if (calendar.primary) {
          this.calendarNameCache.set('primary', calendar.summary);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch calendar names:', error);
    }
  }

  /**
   * Fetch events from a specific calendar.
   */
  private async fetchCalendarEvents(
    calendarId: string,
    timeMin: Date,
    timeMax: Date,
    limit: number
  ): Promise<FetchedItem<CalendarEventMetadata>[]> {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: limit.toString(),
      singleEvents: 'true',
      orderBy: 'startTime',
    });

    const url = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`;
    const response = await this.makeRequest<CalendarApiEventsResponse>(url);

    const items: FetchedItem<CalendarEventMetadata>[] = [];

    for (const event of response.items ?? []) {
      // Skip cancelled events
      if (event.status === 'cancelled') continue;

      const item = this.transformEvent(event, calendarId);
      items.push(item);
    }

    return items;
  }

  /**
   * Make an authenticated request to the Calendar API.
   */
  private async makeRequest<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Calendar API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Transform Calendar API event to FetchedItem.
   */
  private transformEvent(
    event: CalendarApiEvent,
    calendarId: string
  ): FetchedItem<CalendarEventMetadata> {
    const startTime = event.start?.dateTime ?? event.start?.date ?? new Date().toISOString();
    const endTime = event.end?.dateTime ?? event.end?.date ?? new Date().toISOString();
    const isAllDay = !event.start?.dateTime;

    const calendarName = this.calendarNameCache.get(calendarId) || calendarId;
    const title = event.summary ?? '(No title)';

    // Build content string
    const contentParts: string[] = [title];
    if (event.location) {
      contentParts.push(`Location: ${event.location}`);
    }
    if (event.description) {
      contentParts.push(event.description);
    }
    if (event.attendees?.length) {
      const attendeeNames = event.attendees
        .map((a) => a.displayName || a.email.split('@')[0])
        .join(', ');
      contentParts.push(`Attendees: ${attendeeNames}`);
    }

    // Get meeting link
    let meetingLink = event.hangoutLink;
    if (!meetingLink && event.conferenceData?.entryPoints) {
      meetingLink = event.conferenceData.entryPoints.find((ep) => ep.uri)?.uri;
    }

    // Determine organizer
    const organizer = event.organizer ?? event.attendees?.find((a) => a.organizer);
    const organizerName = organizer?.displayName || organizer?.email?.split('@')[0] || 'Unknown';
    const organizerEmail = organizer?.email || '';

    return {
      externalId: event.id,
      sourceType: 'calendar_event',
      title,
      url: `https://calendar.google.com/calendar/event?eid=${this.encodeEventId(event.id, calendarId)}`,
      content: contentParts.join('\n\n'),
      timestamp: new Date(startTime),
      author: {
        id: organizerEmail,
        name: organizerName,
        email: organizerEmail,
      },
      metadata: {
        calendarId,
        calendarName,
        location: event.location,
        attendees: (event.attendees ?? []).map((a) => ({
          name: a.displayName || a.email.split('@')[0],
          email: a.email,
          responseStatus: this.mapResponseStatus(a.responseStatus),
          isOrganizer: a.organizer,
        })),
        meetingLink,
        isAllDay,
        recurrence: event.recurrence?.join('\n'),
        status: this.mapEventStatus(event.status),
      },
    };
  }

  /**
   * Encode event ID for Google Calendar URL.
   */
  private encodeEventId(eventId: string, calendarId: string): string {
    // Google Calendar URLs use base64 encoded event ID and calendar email
    const combined = `${eventId} ${calendarId}`;
    return Buffer.from(combined).toString('base64').replace(/=/g, '');
  }

  /**
   * Map API response status to our type.
   */
  private mapResponseStatus(
    status?: string
  ): 'accepted' | 'declined' | 'tentative' | 'needsAction' {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'declined':
        return 'declined';
      case 'tentative':
        return 'tentative';
      default:
        return 'needsAction';
    }
  }

  /**
   * Map API event status to our type.
   */
  private mapEventStatus(status?: string): 'confirmed' | 'tentative' | 'cancelled' {
    switch (status) {
      case 'confirmed':
        return 'confirmed';
      case 'tentative':
        return 'tentative';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'confirmed';
    }
  }
}
