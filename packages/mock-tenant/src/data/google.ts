// Google Mock Data - Gmail, Google Drive, Google Calendar

// ============================================================================
// Gmail Data Types
// ============================================================================

export interface GmailMessage {
  id: string;
  threadId: string;
  from: {
    name: string;
    email: string;
  };
  to: Array<{
    name: string;
    email: string;
  }>;
  cc?: Array<{
    name: string;
    email: string;
  }>;
  subject: string;
  snippet: string;
  body: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  receivedAt: string;
}

export interface GmailThread {
  id: string;
  subject: string;
  snippet: string;
  messageCount: number;
  participants: Array<{
    name: string;
    email: string;
  }>;
  labels: string[];
  lastMessageAt: string;
}

// ============================================================================
// Google Drive Data Types
// ============================================================================

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  createdAt: string;
  modifiedAt: string;
  modifiedBy: {
    name: string;
    email: string;
  };
  owners: Array<{
    name: string;
    email: string;
  }>;
  parentFolderId?: string;
  webViewLink: string;
  size?: number;
  starred: boolean;
  shared: boolean;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentFolderId?: string;
  createdAt: string;
  modifiedAt: string;
}

// ============================================================================
// Google Calendar Data Types
// ============================================================================

export interface CalendarEvent {
  id: string;
  calendarId: string;
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  attendees: Array<{
    name: string;
    email: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
    organizer?: boolean;
  }>;
  recurrence?: string;
  meetingLink?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
}

export interface Calendar {
  id: string;
  name: string;
  description?: string;
  primary: boolean;
  color: string;
}

// ============================================================================
// Mock Data
// ============================================================================

export const googleData = {
  // ========================================================================
  // Gmail Mock Data
  // ========================================================================
  gmailMessages: [
    // Thread 1: Customer escalation from Globex
    {
      id: 'gmail-001',
      threadId: 'thread-001',
      from: { name: 'David Kim', email: 'david.kim@globex.com' },
      to: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      cc: [{ name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' }],
      subject: 'Urgent: Search performance issues blocking our rollout',
      snippet: 'Hi Sarah, I wanted to escalate an issue we\'ve been experiencing...',
      body: `Hi Sarah,

I wanted to escalate an issue we've been experiencing with the search functionality. As we discussed in our last call, we're planning to expand from 50 to 200 seats next quarter, but the current search performance is a major blocker.

Key issues:
1. Search queries take 5-10 seconds to return results
2. No date filtering means our team can't find recent documents
3. Special characters in search break the results completely

We've been loyal customers for 2 years and really want to make this expansion work. Can you provide an update on when these issues might be addressed?

Best regards,
David Kim
VP of Product, Globex Corp`,
      labels: ['INBOX', 'IMPORTANT', 'STARRED'],
      isRead: true,
      isStarred: true,
      hasAttachments: false,
      receivedAt: '2025-12-27T14:30:00Z',
    },
    {
      id: 'gmail-002',
      threadId: 'thread-001',
      from: { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
      to: [{ name: 'David Kim', email: 'david.kim@globex.com' }],
      cc: [{ name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' }],
      subject: 'Re: Urgent: Search performance issues blocking our rollout',
      snippet: 'Hi David, Thank you for bringing this to my attention...',
      body: `Hi David,

Thank you for bringing this to my attention. I completely understand how critical search is for your team's productivity, especially as you scale.

I have good news - we're actively working on these exact improvements:

1. Search performance: Our engineering team is implementing a new search index that should reduce query times to under 1 second. Target: End of Sprint 42 (2 weeks)
2. Date filtering: This is 70% complete in our current sprint (ACME-342)
3. Special character bug: We identified this as a P1 (ACME-350) and a fix is already in code review

I'd love to schedule a call to walk you through our roadmap and give you more visibility into the timeline. Would next Tuesday work?

Best,
Sarah`,
      labels: ['SENT'],
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      receivedAt: '2025-12-27T16:45:00Z',
    },

    // Thread 2: Partnership inquiry
    {
      id: 'gmail-003',
      threadId: 'thread-002',
      from: { name: 'Jennifer Lopez', email: 'jlopez@techpartners.io' },
      to: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      subject: 'Partnership Opportunity - Integration with TechPartners Platform',
      snippet: 'Dear Sarah, I hope this email finds you well. I\'m reaching out from TechPartners...',
      body: `Dear Sarah,

I hope this email finds you well. I'm reaching out from TechPartners, where we specialize in enterprise workflow automation.

We've been following Acme's growth and believe there's a strong opportunity for a technical partnership. Our platform serves over 500 enterprise customers, many of whom are asking for better product management integrations.

Would you be open to a discovery call to explore potential synergies? We're particularly interested in:
- API integration possibilities
- Co-marketing opportunities
- Joint customer success programs

Looking forward to hearing from you.

Best regards,
Jennifer Lopez
Head of Partnerships, TechPartners`,
      labels: ['INBOX', 'CATEGORY_UPDATES'],
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      receivedAt: '2025-12-26T09:15:00Z',
    },

    // Thread 3: Feature request from Initech
    {
      id: 'gmail-004',
      threadId: 'thread-003',
      from: { name: 'Mike Bolton', email: 'm.bolton@initech.com' },
      to: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      subject: 'Feature Request: Bulk export functionality',
      snippet: 'Hi Sarah, Following up on our NPS survey response...',
      body: `Hi Sarah,

Following up on our NPS survey response. As mentioned, we love the product but have a specific need that's becoming critical for our compliance team.

We need the ability to bulk export all artifacts and their audit trails. Currently, we have to manually export each item one by one, which isn't sustainable for our quarterly compliance reviews.

Is this something on your roadmap? Happy to jump on a call to discuss our specific requirements.

Thanks,
Mike Bolton
Director of Compliance, Initech`,
      labels: ['INBOX', 'IMPORTANT'],
      isRead: true,
      isStarred: false,
      hasAttachments: false,
      receivedAt: '2025-12-25T11:20:00Z',
    },

    // Thread 4: Internal - Sprint planning
    {
      id: 'gmail-005',
      threadId: 'thread-004',
      from: { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
      to: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
        { name: 'Alex Rivera', email: 'alex.rivera@acme.io' },
      ],
      subject: 'Sprint 42 Planning - Priorities',
      snippet: 'Team, I wanted to align on Sprint 42 priorities before our planning meeting...',
      body: `Team,

I wanted to align on Sprint 42 priorities before our planning meeting tomorrow. Based on our Q4 VoC analysis and customer escalations, I'm proposing the following priority stack:

P0 (Must complete):
- ACME-343: Search ranking improvements
- ACME-342: Search filters (date range, content type)
- ACME-350: Special character bug fix

P1 (Should complete):
- ACME-348: Performance optimization for large datasets
- ACME-345: API rate limiting improvements

P2 (Nice to have):
- ACME-352: Dashboard customization enhancements

Let me know if you have concerns with this prioritization. We have 47 support tickets and 3 enterprise customers specifically blocked on search.

Marcus`,
      labels: ['INBOX', 'STARRED'],
      isRead: true,
      isStarred: true,
      hasAttachments: false,
      receivedAt: '2025-12-24T15:00:00Z',
    },

    // Thread 5: Competitor intelligence
    {
      id: 'gmail-006',
      threadId: 'thread-005',
      from: { name: 'Alex Rivera', email: 'alex.rivera@acme.io' },
      to: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
      ],
      subject: 'Competitor Alert: ProductRival just launched AI features',
      snippet: 'FYI - ProductRival announced their "AI Insights" feature today...',
      body: `FYI - ProductRival announced their "AI Insights" feature today. Key highlights from their launch:

1. Automated PRD generation from customer feedback
2. AI-powered competitive analysis
3. Sentiment analysis on support tickets

Their pricing is aggressive - $49/user/month for the AI tier.

I've attached their feature comparison matrix. We should discuss how this affects our Q1 roadmap.

A few customers have already asked if we have similar capabilities planned.

Alex`,
      labels: ['INBOX', 'IMPORTANT'],
      isRead: true,
      isStarred: false,
      hasAttachments: true,
      receivedAt: '2025-12-23T08:45:00Z',
    },
  ] satisfies GmailMessage[],

  gmailThreads: [
    {
      id: 'thread-001',
      subject: 'Urgent: Search performance issues blocking our rollout',
      snippet: 'Hi David, Thank you for bringing this to my attention...',
      messageCount: 2,
      participants: [
        { name: 'David Kim', email: 'david.kim@globex.com' },
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
      ],
      labels: ['INBOX', 'IMPORTANT', 'STARRED'],
      lastMessageAt: '2025-12-27T16:45:00Z',
    },
    {
      id: 'thread-002',
      subject: 'Partnership Opportunity - Integration with TechPartners Platform',
      snippet: 'Dear Sarah, I hope this email finds you well...',
      messageCount: 1,
      participants: [
        { name: 'Jennifer Lopez', email: 'jlopez@techpartners.io' },
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
      ],
      labels: ['INBOX', 'CATEGORY_UPDATES'],
      lastMessageAt: '2025-12-26T09:15:00Z',
    },
    {
      id: 'thread-003',
      subject: 'Feature Request: Bulk export functionality',
      snippet: 'Hi Sarah, Following up on our NPS survey response...',
      messageCount: 1,
      participants: [
        { name: 'Mike Bolton', email: 'm.bolton@initech.com' },
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
      ],
      labels: ['INBOX', 'IMPORTANT'],
      lastMessageAt: '2025-12-25T11:20:00Z',
    },
    {
      id: 'thread-004',
      subject: 'Sprint 42 Planning - Priorities',
      snippet: 'Team, I wanted to align on Sprint 42 priorities...',
      messageCount: 1,
      participants: [
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
        { name: 'Alex Rivera', email: 'alex.rivera@acme.io' },
      ],
      labels: ['INBOX', 'STARRED'],
      lastMessageAt: '2025-12-24T15:00:00Z',
    },
    {
      id: 'thread-005',
      subject: 'Competitor Alert: ProductRival just launched AI features',
      snippet: 'FYI - ProductRival announced their "AI Insights" feature today...',
      messageCount: 1,
      participants: [
        { name: 'Alex Rivera', email: 'alex.rivera@acme.io' },
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
      ],
      labels: ['INBOX', 'IMPORTANT'],
      lastMessageAt: '2025-12-23T08:45:00Z',
    },
  ] satisfies GmailThread[],

  // ========================================================================
  // Google Drive Mock Data
  // ========================================================================
  driveFolders: [
    {
      id: 'folder-root',
      name: 'My Drive',
      createdAt: '2024-01-01T00:00:00Z',
      modifiedAt: '2025-12-28T00:00:00Z',
    },
    {
      id: 'folder-product',
      name: 'Product',
      parentFolderId: 'folder-root',
      createdAt: '2024-02-15T10:00:00Z',
      modifiedAt: '2025-12-27T14:30:00Z',
    },
    {
      id: 'folder-prds',
      name: 'PRDs',
      parentFolderId: 'folder-product',
      createdAt: '2024-02-15T10:05:00Z',
      modifiedAt: '2025-12-20T09:00:00Z',
    },
    {
      id: 'folder-roadmaps',
      name: 'Roadmaps',
      parentFolderId: 'folder-product',
      createdAt: '2024-02-15T10:10:00Z',
      modifiedAt: '2025-12-15T11:00:00Z',
    },
    {
      id: 'folder-research',
      name: 'Customer Research',
      parentFolderId: 'folder-product',
      createdAt: '2024-03-01T14:00:00Z',
      modifiedAt: '2025-12-22T16:45:00Z',
    },
  ] satisfies DriveFolder[],

  driveFiles: [
    // PRD Documents
    {
      id: 'doc-001',
      name: 'PRD: Search Improvements v2',
      mimeType: 'application/vnd.google-apps.document',
      description: 'Product requirements for search ranking and filtering improvements',
      createdAt: '2025-11-15T10:00:00Z',
      modifiedAt: '2025-12-27T14:30:00Z',
      modifiedBy: { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
      owners: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      parentFolderId: 'folder-prds',
      webViewLink: 'https://docs.google.com/document/d/doc-001',
      starred: true,
      shared: true,
    },
    {
      id: 'doc-002',
      name: 'PRD: Enterprise Export & Audit',
      mimeType: 'application/vnd.google-apps.document',
      description: 'Requirements for bulk export and audit trail features',
      createdAt: '2025-12-01T09:00:00Z',
      modifiedAt: '2025-12-22T11:15:00Z',
      modifiedBy: { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
      owners: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      parentFolderId: 'folder-prds',
      webViewLink: 'https://docs.google.com/document/d/doc-002',
      starred: false,
      shared: true,
    },

    // Roadmap Documents
    {
      id: 'sheet-001',
      name: 'Q1 2026 Roadmap',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      description: 'Quarterly roadmap with timeline and dependencies',
      createdAt: '2025-12-01T10:00:00Z',
      modifiedAt: '2025-12-26T15:00:00Z',
      modifiedBy: { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
      owners: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      parentFolderId: 'folder-roadmaps',
      webViewLink: 'https://docs.google.com/spreadsheets/d/sheet-001',
      starred: true,
      shared: true,
    },
    {
      id: 'slide-001',
      name: 'Product Strategy 2026',
      mimeType: 'application/vnd.google-apps.presentation',
      description: 'Annual product strategy presentation for leadership',
      createdAt: '2025-11-20T14:00:00Z',
      modifiedAt: '2025-12-20T10:30:00Z',
      modifiedBy: { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' },
      owners: [{ name: 'Marcus Johnson', email: 'marcus.johnson@acme.io' }],
      parentFolderId: 'folder-roadmaps',
      webViewLink: 'https://docs.google.com/presentation/d/slide-001',
      starred: false,
      shared: true,
    },

    // Research Documents
    {
      id: 'doc-003',
      name: 'Q4 2025 VoC Analysis',
      mimeType: 'application/vnd.google-apps.document',
      description: 'Voice of Customer analysis report for Q4',
      createdAt: '2025-12-15T09:00:00Z',
      modifiedAt: '2025-12-27T16:00:00Z',
      modifiedBy: { name: 'Sarah Chen', email: 'sarah.chen@acme.io' },
      owners: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      parentFolderId: 'folder-research',
      webViewLink: 'https://docs.google.com/document/d/doc-003',
      starred: true,
      shared: true,
    },
    {
      id: 'sheet-002',
      name: 'Customer Interview Notes',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      description: 'Compiled notes from customer discovery interviews',
      createdAt: '2025-10-01T11:00:00Z',
      modifiedAt: '2025-12-22T14:30:00Z',
      modifiedBy: { name: 'Alex Rivera', email: 'alex.rivera@acme.io' },
      owners: [{ name: 'Sarah Chen', email: 'sarah.chen@acme.io' }],
      parentFolderId: 'folder-research',
      webViewLink: 'https://docs.google.com/spreadsheets/d/sheet-002',
      starred: false,
      shared: true,
    },
    {
      id: 'doc-004',
      name: 'Competitor Analysis - ProductRival',
      mimeType: 'application/vnd.google-apps.document',
      description: 'Detailed analysis of ProductRival features and positioning',
      createdAt: '2025-12-23T10:00:00Z',
      modifiedAt: '2025-12-23T17:30:00Z',
      modifiedBy: { name: 'Alex Rivera', email: 'alex.rivera@acme.io' },
      owners: [{ name: 'Alex Rivera', email: 'alex.rivera@acme.io' }],
      parentFolderId: 'folder-research',
      webViewLink: 'https://docs.google.com/document/d/doc-004',
      starred: true,
      shared: true,
    },
  ] satisfies DriveFile[],

  // ========================================================================
  // Google Calendar Mock Data
  // ========================================================================
  calendars: [
    {
      id: 'cal-primary',
      name: 'Sarah Chen',
      description: 'Primary calendar',
      primary: true,
      color: '#4285F4',
    },
    {
      id: 'cal-product',
      name: 'Product Team',
      description: 'Shared product team calendar',
      primary: false,
      color: '#0B8043',
    },
    {
      id: 'cal-customer',
      name: 'Customer Meetings',
      description: 'External customer calls and meetings',
      primary: false,
      color: '#F4511E',
    },
  ] satisfies Calendar[],

  calendarEvents: [
    // Today's meetings
    {
      id: 'event-001',
      calendarId: 'cal-primary',
      title: 'Sprint 42 Planning',
      description: 'Quarterly sprint planning session - review priorities and capacity',
      location: 'Conference Room A',
      startTime: '2025-12-28T09:00:00Z',
      endTime: '2025-12-28T10:30:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io', responseStatus: 'accepted' },
        { name: 'Alex Rivera', email: 'alex.rivera@acme.io', responseStatus: 'accepted' },
        { name: 'Dev Team', email: 'dev-team@acme.io', responseStatus: 'accepted' },
      ],
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'confirmed',
    },
    {
      id: 'event-002',
      calendarId: 'cal-customer',
      title: 'Globex Corp - Search Issues Follow-up',
      description: 'Follow-up call with David Kim regarding search performance issues and expansion plans',
      startTime: '2025-12-28T14:00:00Z',
      endTime: '2025-12-28T14:45:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'David Kim', email: 'david.kim@globex.com', responseStatus: 'accepted' },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io', responseStatus: 'tentative' },
      ],
      meetingLink: 'https://meet.google.com/xyz-uvwx-rst',
      status: 'confirmed',
    },
    {
      id: 'event-003',
      calendarId: 'cal-product',
      title: 'Weekly Product Sync',
      description: 'Weekly sync on product metrics, customer feedback, and roadmap updates',
      startTime: '2025-12-28T16:00:00Z',
      endTime: '2025-12-28T16:30:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io', responseStatus: 'accepted' },
        { name: 'Alex Rivera', email: 'alex.rivera@acme.io', responseStatus: 'accepted' },
      ],
      recurrence: 'FREQ=WEEKLY;BYDAY=SA',
      meetingLink: 'https://meet.google.com/product-weekly',
      status: 'confirmed',
    },

    // Upcoming meetings
    {
      id: 'event-004',
      calendarId: 'cal-customer',
      title: 'Initech - Quarterly Business Review',
      description: 'QBR with Initech team - discuss usage, roadmap, and renewal',
      startTime: '2025-12-30T15:00:00Z',
      endTime: '2025-12-30T16:00:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'Mike Bolton', email: 'm.bolton@initech.com', responseStatus: 'accepted' },
        { name: 'Account Manager', email: 'am@acme.io', responseStatus: 'accepted' },
      ],
      meetingLink: 'https://meet.google.com/initech-qbr',
      status: 'confirmed',
    },
    {
      id: 'event-005',
      calendarId: 'cal-customer',
      title: 'TechPartners - Partnership Discovery',
      description: 'Initial call to explore partnership opportunities with TechPartners',
      startTime: '2025-12-31T10:00:00Z',
      endTime: '2025-12-31T10:45:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'Jennifer Lopez', email: 'jlopez@techpartners.io', responseStatus: 'accepted' },
      ],
      meetingLink: 'https://meet.google.com/techpartners-discovery',
      status: 'confirmed',
    },
    {
      id: 'event-006',
      calendarId: 'cal-primary',
      title: 'Q1 Planning Offsite',
      description: 'Full-day offsite for Q1 2026 planning with leadership',
      location: 'Offsite Venue - Downtown',
      startTime: '2026-01-06T09:00:00Z',
      endTime: '2026-01-06T17:00:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted' },
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io', responseStatus: 'accepted' },
        { name: 'Executive Team', email: 'exec@acme.io', responseStatus: 'accepted', organizer: true },
      ],
      status: 'confirmed',
    },

    // Past meetings (for context)
    {
      id: 'event-007',
      calendarId: 'cal-customer',
      title: 'Umbrella Corp - Discovery Call',
      description: 'Initial discovery call with Umbrella Corp - enterprise prospect',
      startTime: '2025-12-20T11:00:00Z',
      endTime: '2025-12-20T12:00:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'Sales Rep', email: 'sales@acme.io', responseStatus: 'accepted' },
        { name: 'Umbrella Corp', email: 'contact@umbrellacorp.com', responseStatus: 'accepted' },
      ],
      meetingLink: 'https://meet.google.com/umbrella-discovery',
      status: 'confirmed',
    },
    {
      id: 'event-008',
      calendarId: 'cal-product',
      title: 'Search Feature Design Review',
      description: 'Design review for search improvements - ACME-342 and ACME-343',
      startTime: '2025-12-22T14:00:00Z',
      endTime: '2025-12-22T15:00:00Z',
      isAllDay: false,
      attendees: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', responseStatus: 'accepted', organizer: true },
        { name: 'Design Team', email: 'design@acme.io', responseStatus: 'accepted' },
        { name: 'Dev Team', email: 'dev-team@acme.io', responseStatus: 'accepted' },
      ],
      meetingLink: 'https://meet.google.com/search-design-review',
      status: 'confirmed',
    },
  ] satisfies CalendarEvent[],
};
