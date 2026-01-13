# Prototype Generation Prompt

Generate a UI prototype from a PRD.

---

## System Prompt

```
You are a UI/UX engineer who creates interactive HTML prototypes from PRDs.

CRITICAL: Output ONLY a complete, standalone HTML file. No markdown, no explanations, no code fences.

Guidelines:
- Create a single HTML file with embedded CSS and JavaScript
- Use modern CSS (flexbox, grid, CSS variables) for styling
- Include interactive elements (dropdowns, buttons, filters) using vanilla JavaScript
- Use a clean, professional design with good typography
- Include realistic placeholder data
- Make all UI elements functional and interactive
- The HTML must be self-contained and work when opened directly in a browser

Design style:
- Use a modern color palette (indigo/blue primary, gray neutrals)
- Clean sans-serif fonts (system fonts)
- Subtle shadows and rounded corners
- Responsive layout that works on different screen sizes

Output: A complete HTML document starting with <!DOCTYPE html> and ending with </html>. Nothing else.
```

---

## User Prompt Template

```
Generate an interactive HTML prototype based on this PRD:

## PRD Content
{{prdContent}}

## Design Guidelines
{{designSystem}}

## Focus Areas
{{focusAreas}}

Create a complete, standalone HTML file that demonstrates the core user experience. The file must:
1. Start with <!DOCTYPE html> and be valid HTML5
2. Include all CSS in a <style> tag in the <head>
3. Include all JavaScript in a <script> tag before </body>
4. Be fully interactive (dropdowns work, buttons respond, filters apply)
5. Look professional and polished

Output ONLY the HTML file content. No markdown, no explanations, no code blocks.
```

---

## Required Context

- `prdContent` - The PRD content to prototype

---

## Output Format

HTML (standalone file)

---

## Usage in ChatGPT/Claude

1. Copy the **System Prompt** and paste it as your first message (or use as custom instructions)
2. Copy the **User Prompt Template** and replace the `{{placeholders}}` with your actual data:
   - `{{prdContent}}` → Paste your PRD content
   - `{{designSystem}}` → Describe your design system (colors, fonts, etc.)
   - `{{focusAreas}}` → Specify which parts of the PRD to focus on

3. **Important**: Ask the model to output ONLY the HTML - no explanations
4. Copy the output and save it as an `.html` file
5. Open the file in your browser to test the prototype

---

## Tips for Better Results

1. **Be specific about interactions**: "The filter dropdown should update results in real-time"
2. **Include sample data**: Provide realistic data for the prototype to display
3. **Specify the scope**: "Focus on the search results page with filters"
4. **Mention responsive needs**: "Should work on mobile and desktop"

---

## Example Output

The output will be a complete HTML file like:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Search Filters Prototype</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }
    .container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .search-box {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .filters-bar {
      display: flex;
      gap: 12px;
      padding: 12px 16px;
      background: #f8fafc;
    }
    .filter-select {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
    }
    .result-item {
      padding: 16px;
      border-bottom: 1px solid #e2e8f0;
      cursor: pointer;
    }
    .result-item:hover { background: #f8fafc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="search-box">
      <div class="filters-bar">
        <select class="filter-select" id="dateFilter">
          <option value="all">All time</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
        <select class="filter-select" id="typeFilter">
          <option value="all">All types</option>
          <option value="documents">Documents</option>
          <option value="projects">Projects</option>
        </select>
      </div>
      <div id="results">
        <!-- Results rendered by JavaScript -->
      </div>
    </div>
  </div>
  <script>
    const data = [
      { type: 'documents', title: 'Q4 Roadmap', date: '2 days ago' },
      { type: 'projects', title: 'Search Improvements', date: '1 week ago' },
    ];
    
    function renderResults() {
      const typeFilter = document.getElementById('typeFilter').value;
      const filtered = typeFilter === 'all' 
        ? data 
        : data.filter(item => item.type === typeFilter);
      
      document.getElementById('results').innerHTML = filtered
        .map(item => `<div class="result-item">${item.title}</div>`)
        .join('');
    }
    
    document.getElementById('typeFilter').addEventListener('change', renderResults);
    renderResults();
  </script>
</body>
</html>
```

Save this as `prototype.html` and open in your browser to interact with it.
