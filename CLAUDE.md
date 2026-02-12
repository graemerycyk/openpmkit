# PM Kit MCP Server — Quick Reference

Read [AGENTS.md](AGENTS.md) for the full developer guide.

## Commands

```bash
source .venv/bin/activate       # activate environment
pip install -e .                # install (runtime only)
pip install -e ".[dev]"         # install with dev tools
pmkit-mcp                       # run server (stdio)
python -m pmkit_mcp             # alternative run
pytest                          # run all 24 tests
pytest -v                       # verbose test output
ruff check pmkit_mcp tests      # lint
mypy pmkit_mcp                  # type check
```

## Key Principles

- **Stateless** — No database, no files, no sessions. Each tool call is independent.
- **LLM-agnostic** — Server renders prompts. The client's model processes them.
- **Self-documenting** — Tools describe their own fields via JSON Schema.
- **Conversational** — Missing required fields produce helpful guidance, not errors.
- **Read before editing** — Understand existing code before modifying.

## Critical Files

| File | Purpose |
|------|---------|
| `pmkit_mcp/server.py` | MCP server — tool registration, routing, handlers |
| `pmkit_mcp/renderer.py` | Template rendering, field validation, help text |
| `pmkit_mcp/workflows/registry.py` | All 13 workflow definitions (system prompts, templates, fields) |
| `pmkit_mcp/__main__.py` | `python -m pmkit_mcp` entry point |
| `pyproject.toml` | Package config, dependencies, tool settings |
| `tests/test_server.py` | Server integration tests (tool calls via MCP SDK) |
| `tests/test_renderer.py` | Prompt rendering tests |
| `tests/test_registry.py` | Workflow definition integrity tests |

## Architecture

```
MCP Client → stdio → Server (server.py)
                        ├── list_tools → returns 15 Tool definitions
                        └── call_tool
                              ├── pmkit_help → help text
                              ├── pmkit_workflow_details → field docs
                              └── workflow_id → renderer.py
                                    ├── validate required fields
                                    └── render {system_prompt, user_prompt}
```

## Workflow Structure

Every workflow in `registry.py` is a `WorkflowDefinition` with:
- `id` — tool name (e.g. `daily_brief`)
- `name` — display name (e.g. "Daily Brief")
- `description` — one-line description
- `system_prompt` — LLM system instructions
- `user_prompt_template` — template with `{{placeholders}}`
- `required_fields` — tuple of `FieldSpec` (must be provided)
- `optional_fields` — tuple of `FieldSpec` (enhance output if provided)
- `output_format` — `markdown` or `html`
- `category` — `autonomous`, `on-demand`, or `beta`

## 15 Tools

| Tool | Type |
|------|------|
| `pmkit_help` | Utility |
| `pmkit_workflow_details` | Utility |
| `daily_brief` | Autonomous |
| `meeting_prep` | Autonomous |
| `sprint_review` | Autonomous |
| `voc_clustering` | On-Demand |
| `competitor_research` | On-Demand |
| `roadmap_alignment` | On-Demand |
| `prd_draft` | On-Demand |
| `prototype_generation` | On-Demand |
| `release_notes` | On-Demand |
| `deck_content` | On-Demand |
| `feature_ideation` | Beta |
| `one_pager` | Beta |
| `tldr` | Beta |

## Dependencies

Runtime: `mcp>=1.0.0`, `pydantic>=2.0.0` (Python 3.10+)

Dev: `pytest`, `pytest-asyncio`, `ruff`, `mypy`

## Adding a Workflow

1. Add `WorkflowDefinition` in `registry.py`
2. Add it to the `WORKFLOW_REGISTRY` dict at the bottom
3. Run `pytest` — tests auto-detect the new workflow
4. Update test count in `test_registry_has_13_workflows` (and tool count in `test_list_tools`)
