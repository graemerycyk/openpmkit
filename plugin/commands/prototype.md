---
description: Generate an interactive HTML prototype from a PRD or feature description
argument-hint: "<feature description or PRD link>"
---

# Prototype

> If you see unfamiliar placeholders or need to check which tools are connected, see [CONNECTORS.md](../CONNECTORS.md).

Generate an interactive HTML prototype from a PRD or feature description.

## Workflow

### 1. Get Feature Context

Accept any of:
- A feature description ("user settings page with profile and notifications")
- A PRD link or ticket number
- A pasted PRD document
- A rough sketch description

### 2. Pull Data from Connected Tools

**If the user referenced a ticket or doc, fetch it first.**

If **~~project tracker** (Jira, Linear) is connected:
- Get the ticket/epic details
- Pull acceptance criteria and requirements
- Get user stories

If **~~knowledge base** (Confluence, Notion) is connected:
- Find the PRD if referenced
- Get wireframes or mockups if they exist
- Find design system docs

**If a tool isn't connected, work with what the user provided. Do NOT ask the user to connect tools.**

### 3. Clarify If Needed

If requirements are vague, ask:
- What's the primary user action?
- Desktop, mobile, or both?
- Any specific components needed (forms, tables, modals)?
- Brand colors to use?

### 4. Generate the Prototype

Create a **complete, standalone HTML file** that:
- Is valid HTML5 starting with `<!DOCTYPE html>`
- Has all CSS in a `<style>` tag
- Has all JavaScript in a `<script>` tag
- Is fully interactive — buttons click, forms submit, filters work
- Can be opened directly in any browser

---

## Output Format

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Feature Name] Prototype</title>
  <style>
    /* Reset */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* Base */
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      line-height: 1.5;
    }

    /* Layout */
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }

    /* Components */
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 24px;
      margin-bottom: 16px;
    }

    .button {
      background: #4f46e5;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .button:hover { background: #4338ca; }
    .button-secondary {
      background: white;
      color: #4f46e5;
      border: 1px solid #e2e8f0;
    }
    .button-secondary:hover { background: #f8fafc; }

    .input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
    }
    .input:focus {
      outline: none;
      border-color: #4f46e5;
      box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
    }

    /* Add more component styles as needed */
  </style>
</head>
<body>
  <div class="container">
    <!--
      BUILD THE PROTOTYPE UI HERE
      - Include all screens/states
      - Use realistic placeholder data
      - Make it interactive
    -->
  </div>

  <script>
    // Add interactivity
    // - Form submissions
    // - Button clicks
    // - Tab switching
    // - Modal open/close
    // - Filter/sort functionality
  </script>
</body>
</html>
```

---

## Design Guidelines

### Colors
- **Primary:** #4F46E5 (Indigo)
- **Primary hover:** #4338CA
- **Background:** #F8FAFC
- **Surface:** #FFFFFF
- **Text:** #1E293B
- **Text muted:** #64748B
- **Border:** #E2E8F0
- **Success:** #10B981
- **Error:** #EF4444
- **Warning:** #F59E0B

### Typography
- Font: System stack (fast, native feel)
- Headings: 600 weight
- Body: 400 weight
- Small: 14px, Body: 16px, Headings: 18-32px

### Spacing
- Base unit: 4px
- Common: 8, 12, 16, 24, 32, 48px

### Components to Include
- Buttons (primary, secondary, ghost)
- Form inputs with focus states
- Cards with shadows
- Tables with hover states
- Modals/dialogs
- Tabs and navigation
- Loading states
- Empty states
- Error states

---

## After Generation

Tell the user:

1. **Save the file:** Copy the HTML and save as `prototype.html`
2. **Open in browser:** Double-click the file or drag to browser
3. **Test interactions:** Click buttons, fill forms, try all flows
4. **Share for feedback:** Send the HTML file to stakeholders
5. **Iterate:** Come back with feedback and I'll update it

---

## Notes

- Pull PRD/ticket content FIRST if referenced
- Make it interactive — static mockups aren't prototypes
- Use realistic data — "John Smith" not "User Name"
- Include all states — empty, loading, error, success
- Mobile-friendly by default (use responsive CSS)
- One HTML file — no external dependencies
