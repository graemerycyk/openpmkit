# openpmkit Claude Plugin

AI-powered PM workflows for Claude Cowork and Claude Code.

## Installation

### Claude Cowork (Desktop)

1. Open Claude Desktop
2. Go to Settings → Plugins
3. Click "Add Plugin" and select this folder
4. The plugin skills will be available immediately

### Claude Code (CLI)

Copy the skills to your Claude Code skills directory:

```bash
cp -r plugin/skills/* ~/.claude/skills/
```

Or symlink for development:

```bash
ln -s $(pwd)/plugin/skills/* ~/.claude/skills/
```

## Available Commands

| Command | Description |
|---------|-------------|
| `/pmkit-help` | Show all available commands |
| `/daily-brief` | Morning context summary |
| `/meeting-prep [account]` | Pre-meeting research pack |
| `/feature-intel` | Voice of Customer clustering |
| `/prd-draft [feature]` | Generate a PRD |
| `/sprint-review` | Sprint summary with metrics |
| `/competitor` | Competitor intelligence |
| `/roadmap [decision]` | Alignment memo with options |
| `/release-notes` | Customer-facing release notes |
| `/deck-content [topic]` | Slide content for any audience |
| `/prototype` | Interactive HTML prototype |

## Usage Examples

```
/daily-brief

/meeting-prep Acme Corp

/prd-draft Search Filters --epic ACME-100

/competitor --days 14

/deck-content Q4 Update --audience exec

/prototype [paste PRD content here]
```

## Required Integrations

For full functionality, connect these integrations in Claude:

### Native Connectors (Recommended)
- **Atlassian** (Jira, Confluence) - tickets, sprints, docs
- **Google Workspace** (Gmail, Calendar, Drive) - emails, meetings, docs
- **Linear** - issues and project tracking

### Via Zapier
- **Slack** - channel activity and messages
- **Gong** - call transcripts and insights
- **Zendesk** - support tickets
- **Zoom** - meeting recordings

## Plugin Structure

```
plugin/
├── README.md
└── skills/
    ├── pmkit-help/
    │   └── SKILL.md
    ├── daily-brief/
    │   └── SKILL.md
    ├── meeting-prep/
    │   └── SKILL.md
    ├── feature-intel/
    │   └── SKILL.md
    ├── prd-draft/
    │   └── SKILL.md
    ├── sprint-review/
    │   └── SKILL.md
    ├── competitor/
    │   └── SKILL.md
    ├── roadmap/
    │   └── SKILL.md
    ├── release-notes/
    │   └── SKILL.md
    ├── deck-content/
    │   └── SKILL.md
    └── prototype/
        └── SKILL.md
```

## Customization

Each skill is a markdown file that you can customize:

1. Edit the `SKILL.md` file in any skill directory
2. Modify the instructions, output format, or data sources
3. Changes take effect immediately (restart Claude Code if needed)

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

## License

MIT License - see [LICENSE](../LICENSE)
