import type { ConnectorSourceType, FetchedItem, CalendarEventMetadata } from '../../fetchers/types';
import type { ISourceFormatter } from '../types';

/**
 * Formatter for Google Calendar event sources.
 */
export class CalendarFormatter implements ISourceFormatter<CalendarEventMetadata> {
  readonly sourceType: ConnectorSourceType = 'calendar_event';

  formatForCitation(item: FetchedItem<CalendarEventMetadata>): {
    title: string;
    contextLabel: string;
    contentPreview: string;
  } {
    const attendeeCount = item.metadata.attendees?.length || 0;
    const attendeeInfo = attendeeCount > 0 ? ` (${attendeeCount} attendees)` : '';
    const calendarName = item.metadata.calendarName || 'Calendar';

    return {
      title: item.title + attendeeInfo,
      contextLabel: calendarName,
      contentPreview: this.buildEventPreview(item),
    };
  }

  formatForPrompt(
    items: FetchedItem<CalendarEventMetadata>[],
    getCitationNumber: (item: FetchedItem<CalendarEventMetadata>) => number
  ): string {
    if (items.length === 0) {
      return '';
    }

    // Sort by start time
    const sorted = [...items].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    const sections: string[] = ['## Upcoming Calendar Events', ''];

    for (const item of sorted) {
      const citationNum = getCitationNumber(item);
      const { startStr, durationStr } = this.formatEventTime(item);
      const locationInfo = item.metadata.location ? ` 📍 ${item.metadata.location}` : '';
      const meetingLink = item.metadata.meetingLink ? ' 🔗' : '';
      const statusIcon = this.getStatusIcon(item.metadata.status);

      sections.push(`### [${citationNum}] ${statusIcon} ${item.title}${meetingLink}`);
      sections.push(`**When:** ${startStr} (${durationStr})${locationInfo}`);

      // List attendees
      const attendees = item.metadata.attendees || [];
      if (attendees.length > 0) {
        const attendeeList = attendees
          .map((a) => {
            const status = this.getResponseIcon(a.responseStatus);
            const org = a.isOrganizer ? ' (organizer)' : '';
            return `${status} ${a.name || a.email}${org}`;
          })
          .join(', ');
        sections.push(`**Attendees:** ${attendeeList}`);
      }

      // Description
      if (item.content) {
        sections.push('');
        sections.push(item.content);
      }

      sections.push('');
      sections.push('---');
      sections.push('');
    }

    return sections.join('\n');
  }

  private buildEventPreview(item: FetchedItem<CalendarEventMetadata>): string {
    const parts: string[] = [];

    const { startStr, durationStr } = this.formatEventTime(item);
    parts.push(`${startStr} (${durationStr})`);

    const attendeeCount = item.metadata.attendees?.length || 0;
    if (attendeeCount > 0) {
      parts.push(`${attendeeCount} attendees`);
    }

    if (item.metadata.location) {
      parts.push(item.metadata.location);
    }

    return parts.join(' | ');
  }

  private formatEventTime(item: FetchedItem<CalendarEventMetadata>): {
    startStr: string;
    durationStr: string;
  } {
    if (item.metadata.isAllDay) {
      return {
        startStr: item.timestamp.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        durationStr: 'All day',
      };
    }

    const startStr = item.timestamp.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    // Duration calculation would need end time from metadata
    // For now, just say "meeting"
    const durationStr = 'Meeting';

    return { startStr, durationStr };
  }

  private getStatusIcon(status: 'confirmed' | 'tentative' | 'cancelled'): string {
    switch (status) {
      case 'confirmed':
        return '✅';
      case 'tentative':
        return '❓';
      case 'cancelled':
        return '❌';
      default:
        return '📅';
    }
  }

  private getResponseIcon(
    responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted'
  ): string {
    switch (responseStatus) {
      case 'accepted':
        return '✓';
      case 'declined':
        return '✗';
      case 'tentative':
        return '?';
      case 'needsAction':
      default:
        return '·';
    }
  }
}
