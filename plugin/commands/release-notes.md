---
description: Generate customer-facing release notes from completed work
argument-hint: "[--version v2.4.0] [--sprint 'Sprint 42']"
---

# Release Notes

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate customer-facing release notes from completed work.

## Workflow

### 1. Determine Scope

Identify what to include:
- Use `--version` if releasing a specific version
- Use `--sprint` to get work from a specific sprint
- Default: Get all completed work since last release

### 2. Pull Data from Connected Tools

**Do this first — gather all completed work before writing.**

If **~~project tracker** (Jira, Linear) is connected:
- Get all tickets completed since last release (or in specified sprint)
- Categorize by type: Feature, Improvement, Bug Fix
- Get ticket descriptions and acceptance criteria
- Find related epics for feature context
- Check for any breaking changes or deprecations

If **~~knowledge base** (Confluence, Notion) is connected:
- Find PRDs for shipped features (for better descriptions)
- Get previous release notes format
- Find any customer-facing documentation updates

If **~~support** (Zendesk, Intercom) is connected:
- Find tickets that reported bugs we fixed
- Get customer requests that were addressed
- Note any customers to follow up with

**If a tool isn't connected, skip that source and proceed. Do NOT ask the user to connect tools.**

### 3. Transform Technical → Customer-Facing

For each item:
- Rewrite ticket titles as benefits, not features
- Remove internal jargon
- Focus on what users can now do, not what we built
- Group related items together

### 4. Generate the Release Notes

Produce the release notes in this format:

---

# [Product Name] Release Notes

**Version:** [Version number]
**Release Date:** [Date]

---

## 🎉 Highlights

[2-3 sentences: What's the most exciting thing in this release? Lead with value.]

---

## ✨ New Features

### [Feature Name]

[1-2 sentences describing what users can now do and why it matters]

**What you can do:**
- [Capability 1]
- [Capability 2]
- [Capability 3]

**How to use it:** [Brief instructions or link to docs]

*Requested by [X] customers — thank you for the feedback!*

---

### [Feature Name]

[Description]

**What you can do:**
- [Capability]

---

## 🚀 Improvements

### [Area]
- **[Improvement]** — [Benefit to user]
- **[Improvement]** — [Benefit to user]

### [Area]
- **[Improvement]** — [Benefit to user]

---

## 🐛 Bug Fixes

- **Fixed:** [Issue in user terms]
  - *Previously: [What was broken]*
  - *Now: [What works]*

- **Fixed:** [Issue in user terms]
  - *Previously: [What was broken]*
  - *Now: [What works]*

---

## ⚠️ Breaking Changes

*[Include this section only if there are breaking changes]*

### [Change Name]

**What changed:** [Clear description]

**Why:** [Reason for the change]

**Action required:**
1. [Step 1]
2. [Step 2]

**Deadline:** [When old behavior will stop working, if applicable]

---

## 🔜 Coming Soon

A preview of what's next:

- **[Feature]** — [Brief description]
- **[Feature]** — [Brief description]

---

## 📚 Resources

- [Documentation](link)
- [Migration guide](link) *(if breaking changes)*
- [Support](link)

---

## 💬 Feedback

We'd love to hear what you think! [Link to feedback channel]

---

## Notes

- Pull ALL completed work from project tracker FIRST
- Write for customers, not engineers — no ticket numbers, no jargon
- Lead with benefits: "You can now..." not "We added..."
- Group related changes — don't list every ticket separately
- Highlight customer-requested features — show you listened
- Breaking changes need clear migration paths
- Tone: Helpful, professional, customer-centric
- Keep it scannable — headers, bullets, bold key points
