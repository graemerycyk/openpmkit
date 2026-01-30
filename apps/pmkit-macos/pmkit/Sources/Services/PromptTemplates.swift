import Foundation

/// Prompt templates for all agents
enum PromptTemplates {

    // MARK: - Daily Brief

    static func dailyBrief(
        slackData: SlackFetchResult?,
        jiraData: JiraFetchResult?,
        date: Date = Date()
    ) -> LLMPrompt {
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .full

        var contextParts: [String] = []
        var citationIndex = 1
        var citations: [(Int, String)] = []

        // Build Slack context
        if let slack = slackData {
            var slackContext = "## Slack Activity\n\n"
            let groupedByChannel = Dictionary(grouping: slack.messages) { $0.channelId }

            for (channelId, messages) in groupedByChannel {
                let channelName = slack.channels[channelId]?.name ?? channelId
                slackContext += "### #\(channelName)\n\n"

                for message in messages.prefix(20) {
                    let userName = slack.userNames[message.userId] ?? message.userId
                    let time = message.timestamp.formatted(date: .omitted, time: .shortened)
                    slackContext += "[\(citationIndex)] \(userName) (\(time)): \(message.text)\n"
                    citations.append((citationIndex, message.permalink))
                    citationIndex += 1

                    // Include thread replies
                    if let replies = message.replies {
                        for reply in replies.prefix(5) {
                            let replyUser = slack.userNames[reply.userId] ?? reply.userId
                            slackContext += "  ↳ \(replyUser): \(reply.text)\n"
                        }
                    }
                }
                slackContext += "\n"
            }
            contextParts.append(slackContext)
        }

        // Build Jira context
        if let jira = jiraData {
            var jiraContext = "## Jira Updates\n\n"

            // Group by status category
            let byStatus = Dictionary(grouping: jira.issues) { $0.statusCategory }

            for (category, issues) in byStatus {
                let categoryName = category == "done" ? "Completed" : category == "indeterminate" ? "In Progress" : "To Do"
                jiraContext += "### \(categoryName)\n\n"

                for issue in issues.prefix(15) {
                    jiraContext += "[\(citationIndex)] **\(issue.key)**: \(issue.summary)\n"
                    jiraContext += "   Status: \(issue.status)"
                    if let assignee = issue.assignee {
                        jiraContext += " | Assignee: \(assignee)"
                    }
                    jiraContext += "\n"
                    citations.append((citationIndex, issue.permalink))
                    citationIndex += 1

                    // Add recent comments
                    if let comments = jira.comments[issue.key]?.prefix(2) {
                        for comment in comments {
                            jiraContext += "   💬 \(comment.author): \(comment.body.prefix(100))...\n"
                        }
                    }
                }
                jiraContext += "\n"
            }
            contextParts.append(jiraContext)
        }

        let context = contextParts.joined(separator: "\n---\n\n")

        let system = """
        You are an AI assistant helping product managers start their day with a concise, actionable brief.

        Your task is to synthesize the provided data into a Daily Brief that:
        1. Highlights urgent items that need immediate attention
        2. Summarizes sprint/project progress
        3. Identifies customer signals or feedback themes
        4. Suggests 2-3 recommended actions

        Guidelines:
        - Be concise and scannable (use bullet points and headers)
        - Cite sources using [N] notation that matches the source numbers
        - Focus on what's actionable, not just informational
        - Highlight blockers, escalations, and time-sensitive items first
        - Keep the total brief under 500 words
        """

        let user = """
        Today is \(dateFormatter.string(from: date)).

        Please create a Daily Brief based on the following activity from the past 24 hours:

        \(context)

        Format the brief with these sections:
        1. **TL;DR** (2-3 sentences)
        2. **Urgent Items** (blockers, escalations - if any)
        3. **Sprint Progress** (completed, in progress, blocked)
        4. **Customer Signal** (themes from discussions)
        5. **Recommended Actions** (2-3 specific next steps)

        Include citation numbers [N] when referencing specific messages or issues.
        """

        return LLMPrompt(system: system, user: user, maxTokens: 2048)
    }

    // MARK: - Meeting Prep

    /// Simplified meeting prep for job queue (without full CalendarEvent)
    static func meetingPrepSimple(
        eventTitle: String,
        attendees: [String],
        startTime: Date,
        jiraContext: JiraFetchResult?
    ) -> LLMPrompt {
        var contextParts: [String] = []

        // Meeting details
        var meetingContext = """
        ## Meeting Details
        **Title**: \(eventTitle)
        **Time**: \(startTime.formatted())
        """

        if !attendees.isEmpty {
            meetingContext += "\n**Attendees**: \(attendees.joined(separator: ", "))"
        }

        contextParts.append(meetingContext)

        // Jira context
        if let jira = jiraContext {
            var jiraSection = "\n## Related Jira Issues\n"
            for issue in jira.issues.prefix(10) {
                jiraSection += "- **\(issue.key)**: \(issue.summary) (\(issue.status))\n"
            }
            contextParts.append(jiraSection)
        }

        let context = contextParts.joined(separator: "\n")

        let system = """
        You are an AI assistant helping product managers prepare for meetings.

        Your task is to create a Meeting Prep pack that helps the PM:
        1. Understand the context and key topics
        2. Have relevant talking points ready
        3. Know what questions to ask
        4. Identify potential follow-ups

        Guidelines:
        - Focus on actionable preparation, not general background
        - Suggest specific questions based on the meeting title and attendees
        - Highlight any potential concerns or opportunities
        - Keep it concise and scannable
        """

        let user = """
        Please create a Meeting Prep pack for this upcoming meeting:

        \(context)

        Format the prep with:
        1. **Quick Context** (1-2 sentences on what this meeting is about)
        2. **Key Talking Points** (3-5 bullet points)
        3. **Questions to Ask** (3-5 specific questions)
        4. **Watch Out For** (potential issues or opportunities)
        5. **Follow-up Items** (likely next steps)
        """

        return LLMPrompt(system: system, user: user, maxTokens: 1536)
    }

    static func meetingPrep(
        event: CalendarEvent,
        jiraContext: JiraFetchResult?,
        previousNotes: String?
    ) -> LLMPrompt {
        var contextParts: [String] = []

        // Meeting details
        var meetingContext = """
        ## Meeting Details
        **Title**: \(event.summary)
        **Time**: \(event.startTime.formatted())
        **Duration**: \(Int(event.endTime.timeIntervalSince(event.startTime) / 60)) minutes
        """

        if let attendees = event.attendees, !attendees.isEmpty {
            meetingContext += "\n**Attendees**: \(attendees.joined(separator: ", "))"
        }

        if let description = event.description {
            meetingContext += "\n**Agenda**: \(description)"
        }

        contextParts.append(meetingContext)

        // Jira context
        if let jira = jiraContext {
            var jiraSection = "\n## Related Jira Issues\n"
            for issue in jira.issues.prefix(10) {
                jiraSection += "- **\(issue.key)**: \(issue.summary) (\(issue.status))\n"
            }
            contextParts.append(jiraSection)
        }

        // Previous notes
        if let notes = previousNotes {
            contextParts.append("\n## Previous Meeting Notes\n\(notes)")
        }

        let context = contextParts.joined(separator: "\n")

        let system = """
        You are an AI assistant helping product managers prepare for meetings.

        Your task is to create a Meeting Prep pack that helps the PM:
        1. Understand the context and key topics
        2. Have relevant talking points ready
        3. Know what questions to ask
        4. Identify potential follow-ups

        Guidelines:
        - Focus on actionable preparation, not general background
        - Suggest specific questions based on the agenda
        - Highlight any potential concerns or opportunities
        - Keep it concise and scannable
        """

        let user = """
        Please create a Meeting Prep pack for this upcoming meeting:

        \(context)

        Format the prep with:
        1. **Quick Context** (1-2 sentences on what this meeting is about)
        2. **Key Talking Points** (3-5 bullet points)
        3. **Questions to Ask** (3-5 specific questions)
        4. **Watch Out For** (potential issues or opportunities)
        5. **Follow-up Items** (likely next steps)
        """

        return LLMPrompt(system: system, user: user, maxTokens: 1536)
    }

    // MARK: - Feature Intelligence

    static func featureIntelligence(
        slackData: SlackFetchResult?,
        jiraData: JiraFetchResult?,
        lookbackDays: Int
    ) -> LLMPrompt {
        var contextParts: [String] = []

        // Slack feature discussions
        if let slack = slackData {
            var slackSection = "## Feature Discussions (Slack)\n\n"
            for message in slack.messages.prefix(50) {
                let userName = slack.userNames[message.userId] ?? message.userId
                slackSection += "- \(userName): \(message.text)\n"
            }
            contextParts.append(slackSection)
        }

        // Jira feature requests and bugs
        if let jira = jiraData {
            var jiraSection = "## Feature Requests & Bugs (Jira)\n\n"
            let featureTypes = ["Story", "Feature", "Bug", "Improvement"]
            let relevant = jira.issues.filter { featureTypes.contains($0.issueType) }

            for issue in relevant.prefix(30) {
                jiraSection += "- **\(issue.issueType)** \(issue.key): \(issue.summary)\n"
                if let desc = issue.description?.prefix(200) {
                    jiraSection += "  \(desc)...\n"
                }
            }
            contextParts.append(jiraSection)
        }

        let context = contextParts.joined(separator: "\n---\n\n")

        let system = """
        You are an AI assistant helping product managers identify feature patterns and customer needs.

        Your task is to analyze feature discussions and requests to:
        1. Identify recurring themes and patterns
        2. Cluster related requests together
        3. Assess potential impact and frequency
        4. Surface unexpected or emerging needs

        Guidelines:
        - Look for patterns, not just individual requests
        - Quantify when possible (e.g., "3 customers mentioned...")
        - Separate validated needs from speculative features
        - Consider both explicit requests and implicit pain points
        """

        let user = """
        Analyze the following feature discussions and requests from the past \(lookbackDays) days:

        \(context)

        Provide a Feature Intelligence report with:
        1. **Top Themes** (3-5 recurring themes with frequency)
        2. **Feature Clusters** (group related requests)
        3. **Emerging Signals** (new patterns not seen before)
        4. **Quick Wins** (low-effort, high-value opportunities)
        5. **Needs Further Research** (unclear but potentially important)
        """

        return LLMPrompt(system: system, user: user, maxTokens: 2048)
    }

    // MARK: - PRD Draft

    static func prdDraft(
        epic: JiraEpic,
        featureIntelligence: String?
    ) -> LLMPrompt {
        var contextParts: [String] = []

        // Epic details
        var epicContext = """
        ## Epic Details
        **Key**: \(epic.epic.key)
        **Summary**: \(epic.epic.summary)
        **Status**: \(epic.epic.status)
        """

        if let desc = epic.epic.description {
            epicContext += "\n**Description**:\n\(desc)"
        }

        contextParts.append(epicContext)

        // Linked issues
        if !epic.linkedIssues.isEmpty {
            var linkedSection = "\n## Linked Issues (User Stories)\n"
            for issue in epic.linkedIssues {
                linkedSection += "- **\(issue.key)**: \(issue.summary) (\(issue.status))\n"
            }
            contextParts.append(linkedSection)
        }

        // Comments/discussions
        if !epic.comments.isEmpty {
            var commentsSection = "\n## Discussion History\n"
            for comment in epic.comments.prefix(10) {
                commentsSection += "- **\(comment.author)**: \(comment.body.prefix(300))...\n"
            }
            contextParts.append(commentsSection)
        }

        // Feature intelligence context
        if let fi = featureIntelligence {
            contextParts.append("\n## Related Feature Intelligence\n\(fi)")
        }

        let context = contextParts.joined(separator: "\n")

        let system = """
        You are an AI assistant helping product managers draft Product Requirements Documents (PRDs).

        Your task is to create a comprehensive PRD draft that:
        1. Clearly defines the problem and opportunity
        2. Specifies user needs and success metrics
        3. Outlines functional requirements
        4. Identifies risks and dependencies
        5. Provides enough detail for engineering to estimate

        Guidelines:
        - Use evidence from the Jira epic and discussions
        - Be specific about user personas and use cases
        - Include acceptance criteria for key features
        - Highlight open questions that need answers
        - Follow a standard PRD structure
        """

        let user = """
        Create a PRD draft based on this Jira epic and context:

        \(context)

        Use this PRD structure:
        1. **Overview** (problem statement, opportunity)
        2. **Goals & Success Metrics** (what we're measuring)
        3. **User Personas** (who this is for)
        4. **User Stories** (key scenarios)
        5. **Functional Requirements** (detailed specs)
        6. **Non-Functional Requirements** (performance, security)
        7. **Out of Scope** (explicit exclusions)
        8. **Dependencies & Risks**
        9. **Open Questions**
        10. **Timeline Estimate** (T-shirt sizing)
        """

        return LLMPrompt(system: system, user: user, maxTokens: 4096)
    }

    // MARK: - Prototype

    static func prototype(prdContent: String) -> LLMPrompt {
        let system = """
        You are an AI assistant that creates interactive HTML prototypes from PRDs.

        Your task is to generate a working HTML prototype that:
        1. Demonstrates the key user flows
        2. Uses realistic placeholder content
        3. Is interactive (buttons, forms work)
        4. Looks professional and modern
        5. Can be used for stakeholder demos

        Guidelines:
        - Use modern CSS (flexbox, grid, variables)
        - Include basic interactivity with vanilla JavaScript
        - Make it responsive (works on mobile)
        - Use a clean, professional design
        - Include realistic but clearly fake data
        - Add comments for customization points
        """

        let user = """
        Create an interactive HTML prototype based on this PRD:

        \(prdContent)

        Generate a single HTML file that includes:
        - Embedded CSS in a <style> tag
        - Embedded JavaScript in a <script> tag
        - All key screens/states
        - Navigation between screens
        - Form interactions
        - Loading states where appropriate

        The prototype should demonstrate the main user journey described in the PRD.
        Use placeholder content that feels realistic.
        """

        return LLMPrompt(system: system, user: user, maxTokens: 8192)
    }
}
