import { z } from 'zod';
import {
  GoogleRestMCPServer,
  RestOAuthTokens,
  TokenRefreshCallback,
  buildQueryString,
} from '@pmkit/mcp';
import {
  CalendarEventSchema,
  CalendarSchema,
  CalendarEvent,
  Calendar,
} from './index';

// ============================================================================
// Google Calendar API Response Types
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
}

interface CalendarApiCalendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
}

interface CalendarApiEventsResponse {
  items?: CalendarApiEvent[];
  nextPageToken?: string;
}

interface CalendarApiCalendarsResponse {
  items?: CalendarApiCalendar[];
}

// ============================================================================
// Real Google Calendar MCP Server
// ============================================================================

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export class RealGoogleCalendarMCPServer extends GoogleRestMCPServer {
  constructor(
    tokens: RestOAuthTokens,
    options?: {
      onTokenRefresh?: TokenRefreshCallback;
      timeout?: number;
    }
  ) {
    super(
      {
        name: 'google-calendar',
        description: 'Google Calendar integration via Google REST API',
        version: '1.0.0',
      },
      tokens,
      options
    );

    this.registerTools();
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_calendars',
      description: 'Get list of calendars',
      inputSchema: z.object({}),
      outputSchema: z.array(CalendarSchema),
      execute: async () => {
        const response = await this.get<CalendarApiCalendarsResponse>(
          `${CALENDAR_API_BASE}/users/me/calendarList`
        );

        return (response.items ?? []).map((c) => this.transformCalendar(c));
      },
    });

    this.registerTool({
      name: 'get_events',
      description: 'Get calendar events',
      inputSchema: z.object({
        calendarId: z.string().optional(),
        timeMin: z.string().optional(),
        timeMax: z.string().optional(),
        status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.object({
        events: z.array(CalendarEventSchema),
        total: z.number(),
      }),
      execute: async (input) => {
        const calendarId = input.calendarId ?? 'primary';
        const url = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events${buildQueryString({
          timeMin: input.timeMin ? new Date(input.timeMin).toISOString() : undefined,
          timeMax: input.timeMax ? new Date(input.timeMax).toISOString() : undefined,
          maxResults: input.limit,
          singleEvents: true,
          orderBy: 'startTime',
        })}`;

        const response = await this.get<CalendarApiEventsResponse>(url);

        let events = (response.items ?? []).map((e) =>
          this.transformEvent(e, calendarId)
        );

        if (input.status) {
          events = events.filter((e) => e.status === input.status);
        }

        return {
          events,
          total: events.length,
        };
      },
    });

    this.registerTool({
      name: 'get_event',
      description: 'Get a specific event by ID',
      inputSchema: z.object({
        eventId: z.string(),
        calendarId: z.string().optional(),
      }),
      outputSchema: CalendarEventSchema.nullable(),
      execute: async (input) => {
        try {
          const calendarId = input.calendarId ?? 'primary';
          const url = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${input.eventId}`;
          const event = await this.get<CalendarApiEvent>(url);
          return this.transformEvent(event, calendarId);
        } catch {
          return null;
        }
      },
    });

    this.registerTool({
      name: 'get_upcoming_events',
      description: 'Get upcoming events from now',
      inputSchema: z.object({
        daysAhead: z.number().optional().default(7),
        limit: z.number().optional().default(20),
      }),
      outputSchema: z.array(CalendarEventSchema),
      execute: async (input) => {
        const now = new Date();
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + input.daysAhead!);

        const url = `${CALENDAR_API_BASE}/calendars/primary/events${buildQueryString({
          timeMin: now.toISOString(),
          timeMax: maxDate.toISOString(),
          maxResults: input.limit,
          singleEvents: true,
          orderBy: 'startTime',
        })}`;

        const response = await this.get<CalendarApiEventsResponse>(url);

        return (response.items ?? [])
          .filter((e) => e.status !== 'cancelled')
          .map((e) => this.transformEvent(e, 'primary'));
      },
    });

    this.registerTool({
      name: 'get_today_events',
      description: 'Get events happening today',
      inputSchema: z.object({
        calendarId: z.string().optional(),
      }),
      outputSchema: z.array(CalendarEventSchema),
      execute: async (input) => {
        const calendarId = input.calendarId ?? 'primary';
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const url = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events${buildQueryString({
          timeMin: startOfDay.toISOString(),
          timeMax: endOfDay.toISOString(),
          singleEvents: true,
          orderBy: 'startTime',
        })}`;

        const response = await this.get<CalendarApiEventsResponse>(url);

        return (response.items ?? [])
          .filter((e) => e.status !== 'cancelled')
          .map((e) => this.transformEvent(e, calendarId));
      },
    });

    this.registerTool({
      name: 'get_customer_meetings',
      description: 'Get meetings with external attendees',
      inputSchema: z.object({
        internalDomain: z.string().optional().default('acme.io'),
        daysBack: z.number().optional().default(30),
        daysAhead: z.number().optional().default(7),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(CalendarEventSchema),
      execute: async (input) => {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - input.daysBack!);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + input.daysAhead!);

        const url = `${CALENDAR_API_BASE}/calendars/primary/events${buildQueryString({
          timeMin: minDate.toISOString(),
          timeMax: maxDate.toISOString(),
          maxResults: 250, // Fetch more to filter
          singleEvents: true,
          orderBy: 'startTime',
        })}`;

        const response = await this.get<CalendarApiEventsResponse>(url);

        const events = (response.items ?? [])
          .filter((e) => {
            if (e.status === 'cancelled') return false;
            // Check for external attendees
            return (e.attendees ?? []).some(
              (a) => !a.email.endsWith(`@${input.internalDomain}`)
            );
          })
          .map((e) => this.transformEvent(e, 'primary'));

        return events.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'search_events',
      description: 'Search events by title or description',
      inputSchema: z.object({
        query: z.string(),
        limit: z.number().optional().default(50),
      }),
      outputSchema: z.array(CalendarEventSchema),
      execute: async (input) => {
        // Calendar API supports q parameter for search
        const now = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const url = `${CALENDAR_API_BASE}/calendars/primary/events${buildQueryString({
          q: input.query,
          timeMin: oneYearAgo.toISOString(),
          maxResults: input.limit,
          singleEvents: true,
          orderBy: 'startTime',
        })}`;

        const response = await this.get<CalendarApiEventsResponse>(url);

        return (response.items ?? []).map((e) => this.transformEvent(e, 'primary'));
      },
    });

    this.registerTool({
      name: 'get_recurring_meetings',
      description: 'Get recurring meetings',
      inputSchema: z.object({
        limit: z.number().optional().default(20),
      }),
      outputSchema: z.array(CalendarEventSchema),
      execute: async (input) => {
        // Fetch upcoming events that have recurrence
        const now = new Date();
        const threeMonthsAhead = new Date();
        threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3);

        // Use singleEvents=false to get recurring event instances
        const url = `${CALENDAR_API_BASE}/calendars/primary/events${buildQueryString({
          timeMin: now.toISOString(),
          timeMax: threeMonthsAhead.toISOString(),
          maxResults: 250,
          singleEvents: false,
        })}`;

        const response = await this.get<CalendarApiEventsResponse>(url);

        // Filter to only recurring events
        const recurringEvents = (response.items ?? [])
          .filter((e) => e.recurrence && e.recurrence.length > 0 && e.status !== 'cancelled')
          .map((e) => this.transformEvent(e, 'primary'));

        return recurringEvents.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_meeting_context',
      description: 'Get context for a specific meeting including attendee history',
      inputSchema: z.object({
        eventId: z.string(),
        calendarId: z.string().optional(),
      }),
      outputSchema: z.object({
        event: CalendarEventSchema.nullable(),
        previousMeetings: z.array(CalendarEventSchema),
        externalAttendees: z.array(
          z.object({
            name: z.string(),
            email: z.string(),
            meetingCount: z.number(),
          })
        ),
      }),
      execute: async (input) => {
        const calendarId = input.calendarId ?? 'primary';

        // Get the event
        let event: CalendarEvent | null = null;
        try {
          const eventUrl = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${input.eventId}`;
          const apiEvent = await this.get<CalendarApiEvent>(eventUrl);
          event = this.transformEvent(apiEvent, calendarId);
        } catch {
          return { event: null, previousMeetings: [], externalAttendees: [] };
        }

        // Find external attendees
        const internalDomain = 'acme.io'; // Default - would be configurable
        const externalEmails = event.attendees
          .filter((a) => !a.email.endsWith(`@${internalDomain}`))
          .map((a) => a.email);

        if (externalEmails.length === 0) {
          return { event, previousMeetings: [], externalAttendees: [] };
        }

        // Find previous meetings with these attendees (simplified - full impl would search by attendee)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const previousUrl = `${CALENDAR_API_BASE}/calendars/${encodeURIComponent(calendarId)}/events${buildQueryString({
          timeMin: oneYearAgo.toISOString(),
          timeMax: new Date(event.startTime).toISOString(),
          maxResults: 100,
          singleEvents: true,
          orderBy: 'startTime',
        })}`;

        const previousResponse = await this.get<CalendarApiEventsResponse>(previousUrl);

        const previousMeetings = (previousResponse.items ?? [])
          .filter(
            (e) =>
              e.id !== input.eventId &&
              (e.attendees ?? []).some((a) => externalEmails.includes(a.email))
          )
          .slice(-5) // Last 5
          .reverse()
          .map((e) => this.transformEvent(e, calendarId));

        // Count meetings per external attendee
        const allEventsWithExternal = (previousResponse.items ?? []).concat(
          event as unknown as CalendarApiEvent
        );

        const attendeeCounts = new Map<string, { name: string; count: number }>();
        for (const email of externalEmails) {
          const attendee = event.attendees.find((a) => a.email === email);
          if (attendee) {
            const count = allEventsWithExternal.filter((e) =>
              (e.attendees ?? []).some((a) => a.email === email)
            ).length;
            attendeeCounts.set(email, { name: attendee.name, count });
          }
        }

        const externalAttendees = Array.from(attendeeCounts.entries()).map(
          ([email, data]) => ({
            name: data.name,
            email,
            meetingCount: data.count,
          })
        );

        return {
          event,
          previousMeetings,
          externalAttendees,
        };
      },
    });
  }

  // ============================================================================
  // Transform Calendar API response to our schema
  // ============================================================================

  private transformEvent(e: CalendarApiEvent, calendarId: string): CalendarEvent {
    const startTime = e.start?.dateTime ?? e.start?.date ?? new Date().toISOString();
    const endTime = e.end?.dateTime ?? e.end?.date ?? new Date().toISOString();
    const isAllDay = !e.start?.dateTime;

    // Get meeting link from hangoutLink or conferenceData
    let meetingLink = e.hangoutLink;
    if (!meetingLink && e.conferenceData?.entryPoints) {
      meetingLink = e.conferenceData.entryPoints.find((ep) => ep.uri)?.uri;
    }

    return {
      id: e.id,
      calendarId,
      title: e.summary ?? '(No title)',
      description: e.description,
      location: e.location,
      startTime,
      endTime,
      isAllDay,
      attendees: (e.attendees ?? []).map((a) => ({
        name: a.displayName ?? a.email.split('@')[0],
        email: a.email,
        responseStatus: this.mapResponseStatus(a.responseStatus),
        organizer: a.organizer,
      })),
      recurrence: e.recurrence?.join('\n'),
      meetingLink,
      status: this.mapEventStatus(e.status),
    };
  }

  private transformCalendar(c: CalendarApiCalendar): Calendar {
    return {
      id: c.id,
      name: c.summary,
      description: c.description,
      primary: c.primary ?? false,
      color: c.backgroundColor ?? '#4285f4',
    };
  }

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
