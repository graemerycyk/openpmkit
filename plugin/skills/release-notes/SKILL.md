---
name: release-notes
description: Generate customer-facing release notes from completed work. Use when shipping features, preparing announcements, or updating customers on product changes.
argument-hint: "[--version v2.4.0]"
---

# Release Notes

Generate customer-facing release notes from completed work.

## Arguments

- `--version` - Version number (e.g., "v2.4.0")

## Your Task

Create release notes for: **$ARGUMENTS**

## Data to Gather

Use Claude's connected integrations to pull:

1. **Jira** (via Atlassian connector):
   - Completed issues since last release
   - Epic summaries
   - Bug fixes

2. **Confluence** (via Atlassian connector):
   - Related PRDs for feature context
   - Previous release notes for format

3. **Support** (via Zendesk/Zapier):
   - Customer requests that were addressed
   - Bug reports that were fixed

If release data is not available, ask the user to provide the list of completed work.

## Output Format

Create release notes with these sections:

---

# [Product Name] Release Notes - [Version]

**Release Date:** [Date]
**Version:** [Version]

---

## Highlights

[2-3 sentence overview of the most impactful changes]

### [Top Feature 1]
[Benefit-focused description of what users can now do]

### [Top Feature 2]
[Benefit-focused description of what users can now do]

---

## New Features

### [Feature Name]
[Description focused on user benefit, not implementation]

- [Key capability 1]
- [Key capability 2]
- [Key capability 3]

*[Optional: Note about customer requests addressed]*

### [Feature Name]
[Description]

---

## Improvements

### [Area of Improvement]
- [Improvement 1 with benefit]
- [Improvement 2 with benefit]

### [Area of Improvement]
- [Improvement 1 with benefit]

---

## Bug Fixes

- **Fixed:** [Issue description] ([Ticket ID])
- **Fixed:** [Issue description] ([Ticket ID])
- **Fixed:** [Issue description] ([Ticket ID])

---

## Breaking Changes

*[If applicable]*

### [Breaking Change]
**What changed:** [Description]
**Action required:** [What users need to do]
**Deadline:** [If applicable]

---

## Coming Soon

- **[Feature]** - [Brief description]
- **[Feature]** - [Brief description]

---

## Questions?

- [Documentation link]
- [Support link]
- [Feedback link]

---

## Guidelines

- Write for customers, not engineers - focus on benefits, not implementation
- Use clear, jargon-free language
- Categorize changes: New Features, Improvements, Bug Fixes
- Lead with the most impactful changes
- Include brief descriptions of what each change means for users
- Highlight any breaking changes or required actions prominently
- Keep descriptions concise but informative
- Use active voice and present tense
- Tone: Professional, helpful, and customer-centric
