# Release Notes Prompt

Generate customer-facing release notes from completed work.

---

## System Prompt

```
You are a product marketing writer who creates customer-facing release notes.

Your job is to translate technical work into clear, benefit-focused release notes that customers, sales teams, and CSMs can understand and use.

Guidelines:
- Write for customers, not engineers - focus on benefits, not implementation
- Use clear, jargon-free language
- Categorize changes: New Features, Improvements, Bug Fixes
- Lead with the most impactful changes
- Include brief descriptions of what each change means for users
- Highlight any breaking changes or required actions prominently
- Keep descriptions concise but informative
- Use active voice and present tense

Tone: Professional, helpful, and customer-centric.
```

---

## User Prompt Template

```
Generate customer-facing release notes for {{productName}} release {{releaseVersion}}.

## Release Information
- Version: {{releaseVersion}}
- Release Date: {{releaseDate}}
- Product: {{productName}}

## Completed Work (from Jira)
{{completedIssues}}

## Epic Summaries
{{epicSummaries}}

## Related PRDs
{{relatedPrds}}

## Previous Release Notes Format
{{releaseNotesTemplate}}

Create release notes with these sections:
1. **Highlights** - Top 2-3 most impactful changes with brief benefit statements
2. **New Features** - New capabilities added in this release
3. **Improvements** - Enhancements to existing features
4. **Bug Fixes** - Issues resolved (grouped if many)
5. **Breaking Changes** - Any changes requiring customer action (if applicable)
6. **Coming Soon** - Brief preview of what's next (optional)

For each item, include:
- Clear title
- 1-2 sentence description of the benefit to users
- Link reference (e.g., "Learn more" placeholder)
```

---

## Required Context

- `releaseVersion` - Version number
- `completedIssues` - Completed Jira issues

---

## Output Format

Markdown

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{productName}}` → Your product name
   - `{{releaseVersion}}` → Version number (e.g., "v2.4.0")
   - `{{releaseDate}}` → Release date
   - `{{completedIssues}}` → Paste completed Jira issues
   - `{{epicSummaries}}` → Paste epic summaries
   - `{{relatedPrds}}` → Paste related PRD excerpts
   - `{{releaseNotesTemplate}}` → Paste previous release notes for format reference

---

## Example Output

```markdown
# Acme Platform Release Notes - v2.4.0

**Release Date**: January 13, 2026
**Version**: v2.4.0

---

## 🎉 Highlights

This release brings powerful new search capabilities, performance improvements, 
and important bug fixes to make your experience smoother and more productive.

### Search Filters Are Here!
You can now filter search results by date range and content type, making it 
faster than ever to find exactly what you're looking for. No more scrolling 
through pages of results.

### 23% Faster Search
We've optimized our search infrastructure to deliver results faster. 
P95 latency is now under 350ms.

---

## ✨ New Features

### Search Filters
Filter your search results to find content faster:
- **Date range filters**: All time, Last 7 days, Last 30 days, Last 90 days, or custom range
- **Content type filters**: Documents, Projects, Comments
- **Combined filters**: Use multiple filters together for precise results

*This addresses feedback from 89 customers who requested better search capabilities.*

### Bulk Export
Export multiple items at once in CSV or JSON format. Perfect for reporting 
and data analysis.

---

## 🔧 Improvements

### Dashboard Performance
- Dashboard widgets now load 40% faster for large accounts
- Reduced memory usage when viewing complex dashboards

### Search Ranking
- Improved relevance scoring for search results
- Recent content now ranks higher by default
- Better handling of partial matches

### Accessibility
- Improved keyboard navigation throughout the app
- Better screen reader support for search results

---

## 🐛 Bug Fixes

- **Fixed**: Search no longer crashes when using special characters (ACME-350)
- **Fixed**: Dashboard widgets now load correctly for all users (ACME-348)
- **Fixed**: Export button now works on Safari (ACME-345)
- **Fixed**: Notification preferences now save correctly (ACME-341)

---

## ⚠️ Breaking Changes

None in this release.

---

## 🔮 Coming Soon

- **AI-powered search**: Semantic search that understands what you mean, not just what you type
- **Saved searches**: Save your favorite filter combinations for quick access
- **Search analytics**: See what your team is searching for

---

## Questions?

- 📖 [Full documentation](https://docs.example.com)
- 💬 [Contact support](mailto:support@example.com)
- 🐦 [Follow us for updates](https://twitter.com/example)
```
