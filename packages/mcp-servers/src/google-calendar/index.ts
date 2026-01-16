import { z } from 'zod';
import { BaseMCPServer } from '@pmkit/mcp';

// ============================================================================
// Google Calendar Data Types
// ============================================================================

export const CalendarEventSchema = z.object({
  id: z.string(),
  calendarId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  isAllDay: z.boolean(),
  attendees: z.array(
    z.object({
      name: z.string(),
      email: z.string(),
      responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']),
      organizer: z.boolean().optional(),
    })
  ),
  recurrence: z.string().optional(),
  meetingLink: z.string().optional(),
  status: z.enum(['confirmed', 'tentative', 'cancelled']),
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

export const CalendarSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  primary: z.boolean(),
  color: z.string(),
});

export type Calendar = z.infer<typeof CalendarSchema>;

// ============================================================================
// Mock Google Calendar MCP Server
// ============================================================================

export class MockGoogleCalendarMCPServer extends BaseMCPServer {
  private mockEvents: Map<string, CalendarEvent> = new Map();
  private mockCalendars: Map<string, Calendar> = new Map();

  constructor() {
    super({
      name: 'google-calendar',
      description: 'Google Calendar integration for events and scheduling',
      version: '1.0.0',
    });

    this.registerTools();
  }

  loadMockData(events: CalendarEvent[], calendars: Calendar[]): void {
    this.mockEvents.clear();
    this.mockCalendars.clear();

    for (const event of events) {
      this.mockEvents.set(event.id, event);
    }

    for (const calendar of calendars) {
      this.mockCalendars.set(calendar.id, calendar);
    }
  }

  private registerTools(): void {
    this.registerTool({
      name: 'get_calendars',
      description: 'Get list of calendars',
      inputSchema: z.object({}),
      outputSchema: z.array(CalendarSchema),
      execute: async () => {
        return Array.from(this.mockCalendars.values());
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
        let events = Array.from(this.mockEvents.values());

        if (input.calendarId) {
          events = events.filter((e) => e.calendarId === input.calendarId);
        }

        if (input.timeMin) {
          const minDate = new Date(input.timeMin);
          events = events.filter((e) => new Date(e.startTime) >= minDate);
        }

        if (input.timeMax) {
          const maxDate = new Date(input.timeMax);
          events = events.filter((e) => new Date(e.startTime) <= maxDate);
        }

        if (input.status) {
          events = events.filter((e) => e.status === input.status);
        }

        // Sort by start time ascending
        events.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        return {
          events: events.slice(0, input.limit),
          total: events.length,
        };
      },
    });

    this.registerTool({
      name: 'get_event',
      description: 'Get a specific event by ID',
      inputSchema: z.object({ eventId: z.string() }),
      outputSchema: CalendarEventSchema.nullable(),
      execute: async (input) => {
        return this.mockEvents.get(input.eventId) || null;
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

        const events = Array.from(this.mockEvents.values())
          .filter(
            (e) =>
              new Date(e.startTime) >= now &&
              new Date(e.startTime) <= maxDate &&
              e.status !== 'cancelled'
          )
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

        return events.slice(0, input.limit);
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
        const today = new Date();
        const startOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        const endOfDay = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1
        );

        let events = Array.from(this.mockEvents.values()).filter(
          (e) =>
            new Date(e.startTime) >= startOfDay &&
            new Date(e.startTime) < endOfDay &&
            e.status !== 'cancelled'
        );

        if (input.calendarId) {
          events = events.filter((e) => e.calendarId === input.calendarId);
        }

        return events.sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );
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
        const now = new Date();
        const minDate = new Date();
        minDate.setDate(minDate.getDate() - input.daysBack!);
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + input.daysAhead!);

        const events = Array.from(this.mockEvents.values())
          .filter((e) => {
            const eventDate = new Date(e.startTime);
            if (eventDate < minDate || eventDate > maxDate) return false;
            if (e.status === 'cancelled') return false;

            // Check if any attendee is external
            return e.attendees.some(
              (a) => !a.email.endsWith(`@${input.internalDomain}`)
            );
          })
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

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
        const query = input.query.toLowerCase();

        const results = Array.from(this.mockEvents.values())
          .filter(
            (e) =>
              e.title.toLowerCase().includes(query) ||
              e.description?.toLowerCase().includes(query) ||
              e.attendees.some(
                (a) =>
                  a.name.toLowerCase().includes(query) ||
                  a.email.toLowerCase().includes(query)
              )
          )
          .sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          );

        return results.slice(0, input.limit);
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
        const events = Array.from(this.mockEvents.values())
          .filter((e) => e.recurrence && e.status !== 'cancelled')
          .sort(
            (a, b) =>
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );

        return events.slice(0, input.limit);
      },
    });

    this.registerTool({
      name: 'get_meeting_context',
      description: 'Get context for a specific meeting including attendee history',
      inputSchema: z.object({
        eventId: z.string(),
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
        const event = this.mockEvents.get(input.eventId);
        if (!event) {
          return { event: null, previousMeetings: [], externalAttendees: [] };
        }

        // Find previous meetings with same external attendees
        const externalEmails = event.attendees
          .filter((a) => !a.email.endsWith('@acme.io'))
          .map((a) => a.email);

        const previousMeetings = Array.from(this.mockEvents.values())
          .filter(
            (e) =>
              e.id !== event.id &&
              new Date(e.startTime) < new Date(event.startTime) &&
              e.attendees.some((a) => externalEmails.includes(a.email))
          )
          .sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
          )
          .slice(0, 5);

        // Count meetings per external attendee
        const attendeeCounts = new Map<string, { name: string; count: number }>();
        for (const email of externalEmails) {
          const attendee = event.attendees.find((a) => a.email === email);
          if (attendee) {
            const count = Array.from(this.mockEvents.values()).filter((e) =>
              e.attendees.some((a) => a.email === email)
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
}

export const mockGoogleCalendarServer = new MockGoogleCalendarMCPServer();
