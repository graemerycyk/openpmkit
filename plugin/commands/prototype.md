---
description: Generate an interactive HTML prototype from a PRD or feature description
argument-hint: "<feature description or paste PRD>"
---

# PRD to Prototype

Generate an interactive HTML prototype from a PRD or feature description.

## Your Task

Create an interactive HTML prototype for the specified feature.

## Data to Gather

1. **PRD Content** (from user input or Confluence):
   - Feature requirements
   - User stories
   - Key flows

2. **Design Context** (ask user if needed):
   - Brand colors
   - Existing design patterns
   - Target devices (desktop/mobile)

## Output Format

Generate a **complete, standalone HTML file** that:

1. Starts with `<!DOCTYPE html>` and is valid HTML5
2. Includes all CSS in a `<style>` tag in the `<head>`
3. Includes all JavaScript in a `<script>` tag before `</body>`
4. Is fully interactive (dropdowns work, buttons respond, filters apply)
5. Looks professional and polished
6. Can be opened directly in a browser

### Design Guidelines

**Colors:**
- Primary: Indigo/blue (#4F46E5)
- Background: Light gray (#F8FAFC)
- Text: Dark gray (#1E293B)
- Borders: Light gray (#E2E8F0)

**Typography:**
- Font: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif)
- Clean, readable sizing

**Components:**
- Rounded corners (8-12px)
- Subtle shadows
- Hover states
- Focus indicators

**Layout:**
- Responsive (works on different screen sizes)
- Clear visual hierarchy
- Adequate whitespace

### HTML Structure Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Feature Name] Prototype</title>
  <style>
    /* Reset and base styles */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    /* Component styles */
    .container { max-width: 1200px; margin: 0 auto; padding: 24px; }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 24px;
    }
    .button {
      background: #4f46e5;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .button:hover { background: #4338ca; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Prototype UI here -->
  </div>
  <script>
    // Interactive functionality here
  </script>
</body>
</html>
```

## Guidelines

- Create a single HTML file with embedded CSS and JavaScript
- Use modern CSS (flexbox, grid, CSS variables) for styling
- Include interactive elements (dropdowns, buttons, filters) using vanilla JavaScript
- Use a clean, professional design with good typography
- Include realistic placeholder data
- Make all UI elements functional and interactive
- The HTML must be self-contained and work when opened directly in a browser

## After Generation

Tell the user:
1. Save the output as a `.html` file (e.g., `prototype.html`)
2. Open it in their browser to interact with the prototype
3. Share with stakeholders for feedback
