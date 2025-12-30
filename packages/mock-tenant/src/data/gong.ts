import type {
  GongCall,
  GongTranscriptSegment,
  GongInsight,
} from '@pmkit/mcp-servers';

export const gongData = {
  calls: [
    {
      id: 'call-001',
      title: 'Globex Corp - Quarterly Business Review',
      scheduledAt: '2025-12-20T14:00:00Z',
      duration: 45,
      participants: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', role: 'internal' as const },
        { name: 'John Smith', email: 'john.smith@globex.com', role: 'external' as const },
        { name: 'Emily Davis', email: 'emily.davis@globex.com', role: 'external' as const },
      ],
      accountName: 'Globex Corp',
      dealStage: 'Customer',
      topics: ['search', 'expansion', 'roadmap'],
      sentiment: 'mixed' as const,
    },
    {
      id: 'call-002',
      title: 'Initech - Product Demo',
      scheduledAt: '2025-12-18T10:00:00Z',
      duration: 60,
      participants: [
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io', role: 'internal' as const },
        { name: 'Bill Lumbergh', email: 'bill.lumbergh@initech.com', role: 'external' as const },
      ],
      accountName: 'Initech',
      dealStage: 'Negotiation',
      topics: ['demo', 'pricing', 'integrations'],
      sentiment: 'positive' as const,
    },
    {
      id: 'call-003',
      title: 'Umbrella Corp - Technical Deep Dive',
      scheduledAt: '2025-12-15T15:00:00Z',
      duration: 90,
      participants: [
        { name: 'Sarah Chen', email: 'sarah.chen@acme.io', role: 'internal' as const },
        { name: 'Dev Team', email: 'dev.team@acme.io', role: 'internal' as const },
        { name: 'Alice Wong', email: 'alice.wong@umbrella.com', role: 'external' as const },
        { name: 'Bob Chen', email: 'bob.chen@umbrella.com', role: 'external' as const },
      ],
      accountName: 'Umbrella Corp',
      dealStage: 'Technical Evaluation',
      topics: ['api', 'security', 'architecture', 'search'],
      sentiment: 'positive' as const,
    },
    {
      id: 'call-004',
      title: 'Weyland Industries - Escalation Follow-up',
      scheduledAt: '2025-12-12T11:00:00Z',
      duration: 30,
      participants: [
        { name: 'Marcus Johnson', email: 'marcus.johnson@acme.io', role: 'internal' as const },
        { name: 'Support Team', email: 'support@acme.io', role: 'internal' as const },
        { name: 'David Weyland', email: 'david@weyland.com', role: 'external' as const },
      ],
      accountName: 'Weyland Industries',
      dealStage: 'Customer',
      topics: ['escalation', 'performance', 'sla'],
      sentiment: 'negative' as const,
    },
  ] satisfies GongCall[],

  transcripts: [
    // Globex Corp QBR
    {
      callId: 'call-001',
      speaker: 'John Smith',
      speakerRole: 'external' as const,
      text: "Let me be direct - search is our biggest pain point right now. Our team spends 20-30 minutes a day just trying to find documents. It's really impacting productivity.",
      startTime: 120,
      endTime: 135,
      topics: ['search', 'pain-point'],
    },
    {
      callId: 'call-001',
      speaker: 'Sarah Chen',
      speakerRole: 'internal' as const,
      text: "I completely understand, and I want you to know this is our top priority. We're shipping major search improvements in the next two weeks, including filters and better relevance.",
      startTime: 136,
      endTime: 150,
      topics: ['search', 'roadmap'],
    },
    {
      callId: 'call-001',
      speaker: 'Emily Davis',
      speakerRole: 'external' as const,
      text: "That's good to hear. We were planning to expand from 50 to 200 seats in Q1, but honestly, we've been hesitant because of the search issues. If that gets fixed, we're ready to move forward.",
      startTime: 155,
      endTime: 170,
      topics: ['search', 'expansion', 'blocker'],
    },
    {
      callId: 'call-001',
      speaker: 'John Smith',
      speakerRole: 'external' as const,
      text: 'Specifically, we need date filters - being able to search within the last week or month would be huge. And content type filters too.',
      startTime: 200,
      endTime: 212,
      topics: ['search', 'feature-request'],
    },

    // Initech Demo
    {
      callId: 'call-002',
      speaker: 'Bill Lumbergh',
      speakerRole: 'external' as const,
      text: "Yeah, so we've been looking at several solutions. What I really like about yours is the Slack integration. That's going to be key for our team.",
      startTime: 300,
      endTime: 315,
      topics: ['integrations', 'positive-feedback'],
    },
    {
      callId: 'call-002',
      speaker: 'Marcus Johnson',
      speakerRole: 'internal' as const,
      text: 'Great! The Slack integration is one of our most popular features. You can get notifications, create items directly from Slack, and search right from the Slack interface.',
      startTime: 316,
      endTime: 330,
      topics: ['integrations', 'demo'],
    },
    {
      callId: 'call-002',
      speaker: 'Bill Lumbergh',
      speakerRole: 'external' as const,
      text: "One question - how does the search work? We have about 10,000 documents and I'm wondering about performance.",
      startTime: 450,
      endTime: 460,
      topics: ['search', 'question'],
    },

    // Umbrella Corp Technical Deep Dive
    {
      callId: 'call-003',
      speaker: 'Alice Wong',
      speakerRole: 'external' as const,
      text: "We evaluated three competitors before coming to you. Your API is the cleanest, but we're concerned about search. We heard there have been some issues.",
      startTime: 600,
      endTime: 615,
      topics: ['api', 'search', 'competitor'],
    },
    {
      callId: 'call-003',
      speaker: 'Sarah Chen',
      speakerRole: 'internal' as const,
      text: "Thank you for the feedback on the API! On search - yes, we've heard this from customers and it's our current focus. We're shipping improvements this month.",
      startTime: 616,
      endTime: 630,
      topics: ['search', 'roadmap'],
    },
    {
      callId: 'call-003',
      speaker: 'Bob Chen',
      speakerRole: 'external' as const,
      text: 'From a security standpoint, we need to understand how you handle data isolation. We have strict compliance requirements.',
      startTime: 1200,
      endTime: 1212,
      topics: ['security', 'compliance'],
    },

    // Weyland Escalation
    {
      callId: 'call-004',
      speaker: 'David Weyland',
      speakerRole: 'external' as const,
      text: "I'm going to be honest - we're frustrated. This is the third performance issue in two months. We're paying enterprise rates and expecting enterprise reliability.",
      startTime: 60,
      endTime: 75,
      topics: ['performance', 'escalation', 'frustration'],
    },
    {
      callId: 'call-004',
      speaker: 'Marcus Johnson',
      speakerRole: 'internal' as const,
      text: 'I completely understand your frustration, David. This is not the experience we want for you. Let me walk you through what happened and what we\'re doing to prevent it.',
      startTime: 76,
      endTime: 90,
      topics: ['escalation', 'resolution'],
    },
  ] satisfies GongTranscriptSegment[],

  insights: [
    // Globex insights
    {
      callId: 'call-001',
      type: 'pain_point' as const,
      text: 'Search is causing 20-30 minutes of lost productivity per day per user',
      context: 'Customer explicitly stated search is their biggest pain point',
      speaker: 'John Smith',
      timestamp: 120,
    },
    {
      callId: 'call-001',
      type: 'feature_request' as const,
      text: 'Date range filters and content type filters for search',
      context: 'Customer specifically requested these filter types',
      speaker: 'John Smith',
      timestamp: 200,
    },
    {
      callId: 'call-001',
      type: 'objection' as const,
      text: 'Expansion from 50 to 200 seats blocked by search issues',
      context: 'Customer hesitant to expand due to search problems',
      speaker: 'Emily Davis',
      timestamp: 155,
    },

    // Initech insights
    {
      callId: 'call-002',
      type: 'positive_feedback' as const,
      text: 'Slack integration is a key differentiator',
      context: 'Customer highlighted Slack integration as reason for choosing us',
      speaker: 'Bill Lumbergh',
      timestamp: 300,
    },
    {
      callId: 'call-002',
      type: 'question' as const,
      text: 'Search performance with 10,000+ documents',
      context: 'Customer concerned about search at scale',
      speaker: 'Bill Lumbergh',
      timestamp: 450,
    },

    // Umbrella insights
    {
      callId: 'call-003',
      type: 'competitor_mention' as const,
      text: 'Evaluated 3 competitors, chose us for API quality',
      context: 'Customer compared us favorably on API but noted search concerns',
      speaker: 'Alice Wong',
      timestamp: 600,
    },
    {
      callId: 'call-003',
      type: 'positive_feedback' as const,
      text: 'API described as "cleanest" among competitors',
      context: 'Technical evaluation favored our API design',
      speaker: 'Alice Wong',
      timestamp: 600,
    },

    // Weyland insights
    {
      callId: 'call-004',
      type: 'pain_point' as const,
      text: 'Third performance issue in two months',
      context: 'Customer frustrated with recurring reliability issues',
      speaker: 'David Weyland',
      timestamp: 60,
    },
    {
      callId: 'call-004',
      type: 'objection' as const,
      text: 'Enterprise pricing not matching enterprise reliability',
      context: 'Customer questioning value at current price point',
      speaker: 'David Weyland',
      timestamp: 60,
    },
  ] satisfies GongInsight[],
};

