# PM Kit MCP Server — Developer & Contributor Guide

This document is the complete reference for anyone working on or extending the PM Kit MCP Server. If you're looking for installation and usage instructions, see [README.md](README.md). For a quick reference card, see [CLAUDE.md](CLAUDE.md).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Directory Structure](#directory-structure)
- [How the Server Works](#how-the-server-works)
- [Workflow Definitions](#workflow-definitions)
- [Prompt Rendering](#prompt-rendering)
- [Tool Registration and Routing](#tool-registration-and-routing)
- [Adding a New Workflow](#adding-a-new-workflow)
- [Modifying an Existing Workflow](#modifying-an-existing-workflow)
- [Testing](#testing)
- [Code Conventions](#code-conventions)
- [Dependencies](#dependencies)
- [Deployment and Distribution](#deployment-and-distribution)
- [Troubleshooting Development Issues](#troubleshooting-development-issues)

---

## Project Overview

PM Kit MCP Server is a Python application that implements the [Model Context Protocol](https://modelcontextprotocol.io/) (MCP). It exposes 13 product management workflows as tools that any MCP-compatible AI assistant (Claude Desktop, Cursor, Claude Code, etc.) can call.

The server does not call any LLM itself. It renders structured prompt templates and returns them to the client. The client's model processes the prompts and generates the final artifact. This makes the server:

- **Stateless** — no database, no file storage, no user sessions
- **LLM-agnostic** — works with any model behind the MCP client
- **Fast** — prompt rendering is string substitution, no network calls
- **Easy to test** — pure functions, no mocks needed for most tests

### Tech Stack

- **Python 3.10+** — minimum version, uses `tuple[...]` and `dict[...]` syntax
- **MCP SDK** (`mcp>=1.0.0`) — Model Context Protocol server framework
- **Pydantic** (`pydantic>=2.0.0`) — used by MCP SDK for schema validation
- **Transport** — stdio (JSON-RPC over stdin/stdout)

---

## Architecture

```
MCP Client (Claude Desktop / Cursor / Claude Code)
    │
    │  stdio transport (JSON-RPC 2.0)
    │
    ▼
┌─────────────────────────────────────────────────────┐
│  pmkit_mcp/server.py                                │
│                                                     │
│  create_server() → Server                           │
│    │                                                │
│    ├─ @server.list_tools()                          │
│    │    Returns 15 Tool definitions with JSON       │
│    │    Schema for each tool's input parameters     │
│    │                                                │
│    └─ @server.call_tool(name, arguments)            │
│         │                                           │
│         ├─ "pmkit_help"                             │
│         │    → _build_help_text()                   │
│         │    → Returns markdown listing all tools   │
│         │                                           │
│         ├─ "pmkit_workflow_details"                  │
│         │    → build_field_summary(workflow)         │
│         │    → Returns field docs for one workflow   │
│         │                                           │
│         └─ Any workflow ID (e.g. "daily_brief")     │
│              │                                      │
│              ├─ Schema validation (MCP SDK)          │
│              │    Rejects if required fields missing │
│              │                                      │
│              ├─ build_missing_fields_message()       │
│              │    (secondary check in our handler)   │
│              │                                      │
│              └─ render_prompt(workflow, arguments)   │
│                   → {system_prompt, user_prompt}     │
│                                                     │
├─────────────────────────────────────────────────────┤
│  pmkit_mcp/renderer.py                              │
│                                                     │
│  render_prompt()         — {{placeholder}} → value  │
│  build_missing_fields_message() — guidance text     │
│  build_field_summary()   — detailed field docs      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  pmkit_mcp/workflows/registry.py                    │
│                                                     │
│  WORKFLOW_REGISTRY: dict[str, WorkflowDefinition]   │
│    13 entries, keyed by workflow ID                  │
│                                                     │
│  Each WorkflowDefinition contains:                  │
│    - system_prompt      (LLM instructions)          │
│    - user_prompt_template (with {{placeholders}})   │
│    - required_fields    (must be provided)           │
│    - optional_fields    (enhance output)             │
│    - output_format      (markdown or html)           │
│    - category           (autonomous/on-demand/beta)  │
└─────────────────────────────────────────────────────┘
```

### Data Flow for a Tool Call

1. MCP client sends `tools/call` with `name="prd_draft"` and `arguments={...}`
2. MCP SDK validates `arguments` against the tool's JSON Schema
3. If schema validation fails → SDK returns error with field names
4. If schema validation passes → our `call_tool` handler runs
5. Handler looks up `WorkflowDefinition` from `WORKFLOW_REGISTRY`
6. `render_prompt()` substitutes `{{placeholders}}` with argument values
7. Missing optional fields become `(not provided)`
8. Returns JSON: `{workflow, output_format, system_prompt, user_prompt}`
9. MCP client's LLM uses the system+user prompts to generate the artifact

---

## Directory Structure

```
openpmkit/
│
├── pmkit_mcp/                       # MCP server package
│   ├── __init__.py                  # Package version: "1.0.0"
│   ├── __main__.py                  # Enables: python -m pmkit_mcp
│   ├── server.py                    # MCP server setup, tool registration, handlers
│   ├── renderer.py                  # Prompt rendering, field validation, help builders
│   └── workflows/
│       ├── __init__.py              # Re-exports WORKFLOW_REGISTRY, WorkflowDefinition
│       └── registry.py             # 13 WorkflowDefinition instances + registry dict
│
├── plugin/                          # Claude Cowork/Code plugin (self-contained, no MCP)
│   ├── .claude-plugin/
│   │   └── plugin.json             # Plugin manifest
│   ├── commands/                    # 15 slash command .md files (13 auto-generated + 2 hand-written)
│   └── README.md                    # Plugin installation and usage
│
├── .claude-plugin/
│   └── marketplace.json             # Plugin marketplace catalog
│
├── scripts/
│   └── build_plugin.py              # Generates command .md files from registry.py
│
├── tests/
│   ├── __init__.py
│   ├── test_registry.py             # Registry integrity, field consistency
│   ├── test_renderer.py             # Rendering, missing fields, summaries
│   └── test_server.py               # Tool listing, calls, error handling
│
├── pyproject.toml                   # Build config, dependencies, tool settings
├── README.md                        # User-facing documentation
├── CLAUDE.md                        # Quick reference for AI assistants
└── AGENTS.md                        # This file
```

---

## How the Server Works

### Entry Points

There are two ways to start the server:

1. **CLI command**: `pmkit-mcp` (installed by pip via `[project.scripts]` in pyproject.toml)
2. **Module**: `python -m pmkit_mcp` (uses `__main__.py`)

Both call `server.py:main()`, which:
1. Configures logging to stderr (stdout is reserved for MCP protocol)
2. Calls `asyncio.run(run_server())`
3. `run_server()` creates the server, opens a stdio transport, and runs until interrupted

### Tool Registration

`create_server()` in `server.py` registers two handler functions:

- `@server.list_tools()` — called when the client requests available tools. Returns a list of 15 `Tool` objects (2 utility + 13 workflows), each with a name, description, and JSON Schema for inputs.

- `@server.call_tool()` — called when the client invokes a tool by name. Routes to the appropriate handler based on the tool name.

### JSON Schema Generation

Each workflow's input schema is built by `_build_tool_schema()` (`server.py:47`). It iterates over the workflow's `required_fields` and `optional_fields`, creating a JSON Schema `properties` object. Required field names are listed in the schema's `required` array, so the MCP SDK enforces them before our handler even runs.

---

## Workflow Definitions

All 13 workflows live in `pmkit_mcp/workflows/registry.py`. Each is a `WorkflowDefinition` dataclass:

```python
@dataclass(frozen=True)
class WorkflowDefinition:
    id: str                          # Tool name (e.g. "daily_brief")
    name: str                        # Display name (e.g. "Daily Brief")
    description: str                 # One-line description
    system_prompt: str               # LLM system instructions
    user_prompt_template: str        # Template with {{placeholders}}
    required_fields: tuple[FieldSpec, ...]  # Must be provided
    optional_fields: tuple[FieldSpec, ...]  # Enhance output if provided
    output_format: str = "markdown"  # Expected output format
    category: str = "on-demand"      # autonomous, on-demand, or beta
```

Each field is a `FieldSpec`:

```python
@dataclass(frozen=True)
class FieldSpec:
    name: str          # Parameter name (e.g. "tenant_name")
    description: str   # Human-readable description
    example: str = ""  # Example value shown in help text
```

### Workflow Categories

| Category | Count | Meaning |
|----------|-------|---------|
| `autonomous` | 3 | Designed for scheduled/recurring use (daily brief, meeting prep, sprint review) |
| `on-demand` | 7 | Run when you need a specific artifact (PRD, release notes, etc.) |
| `beta` | 3 | Newer workflows still being refined (feature ideation, one-pager, TL;DR) |

### The 13 Workflows

| # | ID | Required Fields | Optional Fields |
|---|-----|----------------|-----------------|
| 1 | `daily_brief` | user_name, tenant_name, current_date | slack_messages, jira_updates, support_tickets, community_activity |
| 2 | `meeting_prep` | user_name, tenant_name, account_name, meeting_type, meeting_date | attendees, gong_calls, support_tickets, account_health |
| 3 | `voc_clustering` | tenant_name | support_tickets, gong_insights, community_feedback, nps_verbatims |
| 4 | `competitor_research` | tenant_name, from_date, to_date | competitor_changes, feature_comparison |
| 5 | `roadmap_alignment` | tenant_name, decision_context | voc_themes, analytics_insights, competitor_context, resource_constraints |
| 6 | `prd_draft` | tenant_name, feature_name, customer_evidence | epic_key, analytics_signals, existing_docs, technical_context |
| 7 | `sprint_review` | tenant_name, sprint_name, sprint_start, sprint_end | team_name, completed_stories, sprint_metrics, blockers, customer_feedback |
| 8 | `prototype_generation` | prd_content | design_system, focus_areas |
| 9 | `release_notes` | product_name, release_version, completed_issues | release_date, epic_summaries, related_prds, release_notes_template |
| 10 | `deck_content` | tenant_name, topic, audience_type | purpose, duration, key_data_points, supporting_evidence, related_artifacts, requirements |
| 11 | `feature_ideation` | tenant_name, feature_ideas, problem_statement | slack_discussions, customer_signals, competitive_context, constraints |
| 12 | `one_pager` | tenant_name, purpose, documents | audience, data_points, background, current_status, requirements |
| 13 | `tldr` | source_content | context_type, key_points, call_to_action |

---

## Prompt Rendering

The renderer (`pmkit_mcp/renderer.py`) has three functions:

### `render_prompt(workflow, context) -> (system_prompt, user_prompt)`

1. Takes the workflow's `user_prompt_template`
2. Finds all `{{placeholder}}` names using regex
3. Replaces each with the corresponding value from `context`
4. Missing values become `(not provided)`
5. Returns `(system_prompt, user_prompt)` — system prompt is returned as-is

### `build_missing_fields_message(workflow, provided) -> str | None`

Checks if any required fields are missing from `provided`. Returns a human-readable message listing them with descriptions and examples, or `None` if all are present.

This is a secondary validation — the MCP SDK's schema validation catches missing required fields first. This function exists for cases where the SDK doesn't enforce (e.g. direct function calls in tests).

### `build_field_summary(workflow) -> str`

Generates a markdown summary of a workflow's fields for the `pmkit_workflow_details` tool. Lists required and optional fields with descriptions, examples, output format, and category.

---

## Tool Registration and Routing

The `call_tool` handler in `server.py:180` routes tool calls:

1. `"pmkit_help"` → calls `_build_help_text()` which iterates all workflows grouped by category
2. `"pmkit_workflow_details"` → validates `workflow_id` argument, calls `build_field_summary()`
3. Any workflow ID → looks up `WORKFLOW_REGISTRY[name]`, validates fields, calls `render_prompt()`
4. Unknown name → returns error message suggesting `pmkit_help`

The rendered result is returned as JSON:

```json
{
  "workflow": "Daily Brief",
  "output_format": "markdown",
  "system_prompt": "You are a product management assistant...",
  "user_prompt": "Generate a daily brief for Alice at Acme Corp..."
}
```

---

## Adding a New Workflow

### Step 1: Define the Workflow

Add a new `WorkflowDefinition` in `pmkit_mcp/workflows/registry.py`:

```python
# ---------------------------------------------------------------------------
# 14. Your New Workflow
# ---------------------------------------------------------------------------
YOUR_WORKFLOW = WorkflowDefinition(
    id="your_workflow",                    # Must be unique, snake_case
    name="Your Workflow Name",             # Human-readable
    description="One sentence describing what it does.",
    category="on-demand",                  # autonomous, on-demand, or beta
    system_prompt=(
        "You are a [role] helping PMs with [task].\n\n"
        "Guidelines:\n"
        "- Guideline 1\n"
        "- Guideline 2\n"
    ),
    user_prompt_template=(
        "Do something for {{tenant_name}}.\n\n"
        "## Input Data\n{{input_data}}\n\n"
        "## Output Format\n\n"
        "Create output with:\n"
        "1. **Section 1** - Description\n"
        "2. **Section 2** - Description\n"
    ),
    required_fields=(
        FieldSpec("tenant_name", "Your company name", "Acme Corp"),
        FieldSpec("input_data", "The data to process", "Paste your data here"),
    ),
    optional_fields=(
        FieldSpec("extra_context", "Additional context", "Any relevant background"),
    ),
)
```

### Step 2: Register It

Add the workflow to the `WORKFLOW_REGISTRY` dict at the bottom of `registry.py`:

```python
WORKFLOW_REGISTRY: dict[str, WorkflowDefinition] = {
    w.id: w
    for w in [
        DAILY_BRIEF,
        MEETING_PREP,
        # ... existing workflows ...
        TLDR,
        YOUR_WORKFLOW,       # ← add here
    ]
}
```

### Step 3: Update Tests

In `tests/test_registry.py`, update two things:

1. **Count**: Change `test_registry_has_13_workflows` to expect 14
2. **IDs**: Add `"your_workflow"` to `test_expected_workflow_ids`

In `tests/test_server.py`:

1. **Count**: Change the assertion in `test_list_tools_returns_all_workflows_plus_help` from 15 to 16

### Step 4: Run Tests

```bash
pytest -v
```

All tests should pass. The existing tests automatically verify:
- Your workflow has a non-empty system prompt
- Your workflow has a non-empty user prompt template
- All required field names appear as `{{placeholders}}` in the template
- The category is one of the valid values
- The workflow renders without errors

### Step 5: Test Manually

```bash
pmkit-mcp
```

Connect with your MCP client and call `pmkit_help` to verify the new tool appears. Then call it with and without required fields to test both paths.

---

## Modifying an Existing Workflow

### Changing a System Prompt or Template

Edit the workflow definition in `registry.py`. The prompt text is plain Python strings. Use `\n` for line breaks within strings, or use parenthesized string concatenation for readability.

After editing, run `pytest` to verify no required field placeholders were accidentally removed.

### Adding a New Required Field

1. Add a `FieldSpec` to the workflow's `required_fields` tuple
2. Add the corresponding `{{field_name}}` placeholder to the `user_prompt_template`
3. Run `pytest` — `test_required_field_names_appear_in_template` will fail if you forgot the placeholder

### Moving a Field from Optional to Required

1. Move the `FieldSpec` from `optional_fields` to `required_fields`
2. The placeholder should already exist in the template
3. Run `pytest`

### Changing a Workflow ID

This is a breaking change for anyone using the tool. The `id` is the MCP tool name. If you rename it:

1. Update the `id` field in the workflow definition
2. Update `test_expected_workflow_ids` in `tests/test_registry.py`
3. Update any documentation that references the old name

---

## Testing

### Test Structure

| File | Tests | What It Covers |
|------|-------|----------------|
| `test_registry.py` | 8 | Registry size, types, ID uniqueness, prompts exist, fields in templates, categories, expected IDs |
| `test_renderer.py` | 6 | Placeholder substitution, missing optionals, missing fields message, field summary, all-workflow rendering |
| `test_server.py` | 6 | Tool listing count, help text content, workflow details, schema validation, prompt rendering, unknown tool |

### Running Tests

```bash
# All tests
pytest

# Verbose (shows each test name and result)
pytest -v

# Single file
pytest tests/test_registry.py

# Single test
pytest tests/test_server.py::test_help_tool_returns_text

# With output capture disabled (see print statements)
pytest -s
```

### Key Test Details

**`test_server.py` uses the MCP SDK's internal API**:

The server tests call `server.request_handlers[ListToolsRequest]` and `server.request_handlers[CallToolRequest]` directly, bypassing the transport layer. Results are wrapped in `ServerResult`, so tests access `.root` to get the inner result:

```python
result = await server.request_handlers[CallToolRequest](request)
inner = result.root          # unwrap ServerResult
text = inner.content[0].text # access TextContent
```

**`test_workflow_missing_required_fields_returns_validation_error`**:

When required fields are missing, the MCP SDK's schema validation intercepts the call before our handler runs. The SDK returns an error with `isError=True` and a message mentioning the missing field name. Our test verifies this SDK behavior.

### Writing New Tests

For workflow-level tests, prefer testing through the renderer directly:

```python
from pmkit_mcp.renderer import render_prompt
from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY

def test_my_workflow():
    wf = WORKFLOW_REGISTRY["my_workflow"]
    system, user = render_prompt(wf, {"tenant_name": "TestCo", ...})
    assert "TestCo" in user
    assert "{{" not in user  # no unresolved placeholders
```

For server-level tests, use the request handler pattern shown in `test_server.py`.

---

## Code Conventions

### Python Style

- **Python 3.10+** — uses `tuple[...]`, `dict[...]`, `list[...]` (not `Tuple`, `Dict`, `List`)
- **`from __future__ import annotations`** — used in all modules for forward references
- **Frozen dataclasses** — `WorkflowDefinition` and `FieldSpec` are immutable
- **Type hints** — all function signatures are typed
- **Docstrings** — Google style, present on all public functions

### Naming

- Workflow IDs: `snake_case` (e.g. `daily_brief`, `prd_draft`)
- Workflow constants: `UPPER_SNAKE_CASE` (e.g. `DAILY_BRIEF`, `PRD_DRAFT`)
- Field names: `snake_case` (e.g. `tenant_name`, `sprint_start`)
- Template placeholders: `{{snake_case}}` matching field names

### Linting and Type Checking

```bash
ruff check pmkit_mcp tests       # lint (configured in pyproject.toml)
mypy pmkit_mcp                   # strict type checking
```

Ruff is configured for rules: E (pycodestyle), F (pyflakes), I (isort), N (pep8-naming), W (warnings), UP (pyupgrade).

### Logging

Logs go to stderr (stdout is reserved for MCP JSON-RPC protocol). The logger is named `pmkit_mcp`:

```python
logger = logging.getLogger("pmkit_mcp")
```

---

## Dependencies

### Runtime

| Package | Version | Purpose |
|---------|---------|---------|
| `mcp` | >=1.0.0 | MCP server framework, stdio transport, types |
| `pydantic` | >=2.0.0 | Required by MCP SDK for schema validation |

### Dev

| Package | Version | Purpose |
|---------|---------|---------|
| `pytest` | >=7.0 | Test runner |
| `pytest-asyncio` | >=0.21 | Async test support |
| `ruff` | >=0.1.0 | Linter and formatter |
| `mypy` | >=1.5 | Static type checker |

### Installing

```bash
pip install -e .           # runtime only
pip install -e ".[dev]"    # runtime + dev
```

---

## Deployment and Distribution

### Plugin (Claude Cowork / Claude Code)

The simplest path — no Python, no server setup:

```
/plugin marketplace add graemerycyk/openpmkit
/plugin install openpmkit
```

All 15 slash commands are available immediately. The plugin is self-contained (embeds prompts directly in command markdown files) with no MCP dependency.

### MCP Server (Claude Desktop / Cursor / Claude Code)

1. Clone the repo
2. `python3 -m venv .venv && source .venv/bin/activate`
3. `pip install -e .`
4. Configure their MCP client with the path to `pmkit-mcp`

No Docker, no cloud, no API keys needed. Everything runs locally.

### For Teams

Options for distributing to multiple PMs:

1. **Plugin marketplace** — `/plugin marketplace add graemerycyk/openpmkit` (easiest)
2. **Shared repo** — everyone clones and installs the MCP server locally
3. **pip install from git** — `pip install git+https://github.com/graemerycyk/openpmkit.git`

### Environment Variables

None required. Neither the MCP server nor the plugin has external dependencies at runtime.

### Plugin Build Pipeline

The plugin's 13 workflow commands are auto-generated from `registry.py` (the same source of truth as the MCP server). To regenerate after modifying workflows:

```bash
python scripts/build_plugin.py
```

The 2 hand-written commands (`pmkit-help.md`, `pmkit-setup.md`) are preserved by the build script.

---

## Troubleshooting Development Issues

### "ServerResult has no attribute 'tools'" in tests

You're accessing the result directly instead of unwrapping it. Use `result.root.tools` instead of `result.tools`.

### Tests pass locally but fail in CI

Check the Python version. The codebase requires 3.10+ for `tuple[...]` syntax. If CI uses 3.9, it will fail with a `TypeError`.

### "pytest: no tests ran"

Make sure `asyncio_mode = "auto"` is set in `pyproject.toml` under `[tool.pytest.ini_options]`. Without it, async tests are silently skipped.

### Workflow changes don't appear

After editing `registry.py`, the server uses the updated code on next startup (if installed with `pip install -e .`). No restart needed for test runs — pytest imports fresh each time.

### Ruff complains about imports

Ruff enforces import sorting (isort rules). Run `ruff check --fix pmkit_mcp tests` to auto-fix.

### mypy errors on MCP types

Some MCP SDK types use dynamic models. If mypy complains about `ServerResult`, it's safe to use `# type: ignore` for SDK internals that are hard to type statically. Prefer keeping strict mode on for our own code.
