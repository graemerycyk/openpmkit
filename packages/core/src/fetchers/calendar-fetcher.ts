import { decryptTokens, encryptTokens, type OAuthTokens } from '../connectors';
import type {
  EncryptedCredentials,
  FetchedItem,
  FetchResult,
  IFetcher,
  CalendarFetchOptions,
  CalendarEventMetadata,
} from './types';

// Google OAuth token refresh endpoint
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

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
  private encryptionKey?: string;
  private googleClientId?: string;
  private googleClientSecret?: string;
  private calendarNameCache: Map<string, string> = new Map();

  constructor(tokens: OAuthTokens, encryptionKey?: string) {
    this.tokens = tokens;
    this.encryptionKey = encryptionKey;
    this.googleClientId = process.env.GOOGLE_CLIENT_ID;
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  }

  /**
   * Create fetcher from encrypted credential blob.
   */
  static fromEncrypted(credentials: EncryptedCredentials): CalendarFetcher {
    const tokens = decryptTokens(credentials.encryptedBlob, credentials.encryptionKey);
    return new CalendarFetcher(tokens, credentials.encryptionKey);
  }

  /**
   * Get the current (possibly refreshed) encrypted blob for credential updates.
   */
  getUpdatedEncryptedBlob(): string | null {
    if (!this.encryptionKey) return null;
    return encryptTokens(this.tokens, this.encryptionKey);
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
   * Handles token refresh on 401 errors.
   */
  private async makeRequest<T>(url: string, retryAfterRefresh = true): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.tokens.accessToken}`,
      },
    });

    // Handle token expiration - try to refresh
    if (response.status === 401 && retryAfterRefresh && this.tokens.refreshToken) {
      console.log('[CalendarFetcher] Access token expired, attempting refresh...');
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry the request with the new token
        return this.makeRequest<T>(url, false);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Calendar API error: ${response.status} ${errorText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Refresh the access token using the refresh token.
   */
  private async refreshAccessToken(): Promise<boolean> {
    if (!this.tokens.refreshToken) {
      console.warn('[CalendarFetcher] No refresh token available');
      return false;
    }

    if (!this.googleClientId || !this.googleClientSecret) {
      console.warn('[CalendarFetcher] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET for token refresh');
      return false;
    }

    try {
      const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.googleClientId,
          client_secret: this.googleClientSecret,
          refresh_token: this.tokens.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CalendarFetcher] Token refresh failed:', errorText);
        return false;
      }

      const data = await response.json();

      // Update tokens (refresh token stays the same, access token is new)
      this.tokens = {
        ...this.tokens,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        expiresAt: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      };

      console.log('[CalendarFetcher] Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('[CalendarFetcher] Token refresh error:', error);
      return false;
    }
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
