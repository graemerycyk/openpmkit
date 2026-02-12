#!/usr/bin/env python3
"""Generate Claude Cowork plugin command files from the workflow registry.

Reads WorkflowDefinition objects from pmkit_mcp/workflows/registry.py and
generates one markdown command file per workflow in plugin/commands/.

Usage:
    python scripts/build_plugin.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

# Ensure the project root is on sys.path so we can import pmkit_mcp
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY, WorkflowDefinition

PLUGIN_DIR = PROJECT_ROOT / "plugin"
COMMANDS_DIR = PLUGIN_DIR / "commands"

# Map workflow IDs to shorter slash-command names
COMMAND_NAME_MAP: dict[str, str] = {
    "daily_brief": "daily-brief",
    "meeting_prep": "meeting-prep",
    "sprint_review": "sprint-review",
    "voc_clustering": "feature-intel",
    "competitor_research": "competitor",
    "roadmap_alignment": "roadmap",
    "prd_draft": "prd-draft",
    "prototype_generation": "prototype",
    "release_notes": "release-notes",
    "deck_content": "deck-content",
    "feature_ideation": "feature-ideation",
    "one_pager": "one-pager",
    "tldr": "tldr",
}


def _build_argument_hint(workflow: WorkflowDefinition) -> str:
    """Build the argument-hint string from required fields."""
    if not workflow.required_fields:
        return "<context>"
    parts = [f"<{f.name}>" for f in workflow.required_fields[:2]]
    if len(workflow.required_fields) > 2:
        parts.append("...")
    return " ".join(parts)


def _build_required_fields_section(workflow: WorkflowDefinition) -> str:
    """Build the required fields list."""
    if not workflow.required_fields:
        return "No required fields — you can run this command directly.\n"
    lines = ["The following fields are **required**:\n"]
    for f in workflow.required_fields:
        example = f' (e.g., "{f.example}")' if f.example else ""
        lines.append(f"- **{f.name}**: {f.description}{example}")
    lines.append("")
    lines.append(
        "If any required field is missing from the user's message, ask for it conversationally. "
        "Provide examples to help the user understand what's needed."
    )
    return "\n".join(lines)


def _build_optional_fields_section(workflow: WorkflowDefinition) -> str:
    """Build the optional fields list."""
    if not workflow.optional_fields:
        return "No optional fields for this workflow.\n"
    lines = ["These fields are **optional** but improve output quality:\n"]
    for f in workflow.optional_fields:
        example = f' (e.g., "{f.example}")' if f.example else ""
        lines.append(f"- **{f.name}**: {f.description}{example}")
    lines.append("")
    lines.append(
        "Briefly mention what optional context could help, but don't block on it. "
        "If the user doesn't provide these, proceed without them."
    )
    return "\n".join(lines)


def _indent_template(template: str) -> str:
    """Preserve the user prompt template as-is inside a fenced block."""
    return template


def generate_command_file(workflow: WorkflowDefinition, command_name: str) -> str:
    """Generate the full markdown content for a command file."""
    argument_hint = _build_argument_hint(workflow)
    required_section = _build_required_fields_section(workflow)
    optional_section = _build_optional_fields_section(workflow)
    template = _indent_template(workflow.user_prompt_template)

    # Determine output format guidance
    if workflow.output_format == "html":
        output_guidance = (
            "Output a complete, standalone HTML file. No markdown wrapping, "
            "no code fences — just the raw HTML that can be saved and opened in a browser."
        )
    else:
        output_guidance = "Output in well-structured markdown format."

    content = f"""---
description: {workflow.description}
argument-hint: {argument_hint}
---

If the user provided arguments with the command, parse them here: "$ARGUMENTS"
Use any relevant information from the arguments to pre-fill required fields below.

{workflow.system_prompt}

## Workflow: {workflow.name}

When the user invokes this command, follow these steps:

### Step 1: Collect Required Information

{required_section}

### Step 2: Collect Optional Context (if offered)

{optional_section}

### Step 3: Generate Output

Once you have the required information, use the system prompt above as your guiding instructions and fill in the following template with the collected values. Replace each {{{{placeholder}}}} with the user's input. For any optional field the user didn't provide, use "(not provided)" as the value.

Then generate the full output following the template's structure and the system prompt's guidelines.

<template>
{template}
</template>

### Output Format

{output_guidance}
"""
    return content


def main() -> None:
    COMMANDS_DIR.mkdir(parents=True, exist_ok=True)

    generated = []
    for wf_id, workflow in WORKFLOW_REGISTRY.items():
        command_name = COMMAND_NAME_MAP.get(wf_id, wf_id.replace("_", "-"))
        filepath = COMMANDS_DIR / f"{command_name}.md"
        content = generate_command_file(workflow, command_name)
        filepath.write_text(content)
        generated.append(command_name)
        print(f"  Generated: commands/{command_name}.md")

    print(f"\nGenerated {len(generated)} command files in {COMMANDS_DIR}")
    print("Hand-written commands (pmkit-help.md, pmkit-setup.md) are not overwritten.")


if __name__ == "__main__":
    main()
