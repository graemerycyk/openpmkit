"""Prompt renderer for PM Kit workflows.

Takes a workflow definition and user-provided context values,
and produces a fully rendered (system_prompt, user_prompt) pair
ready to send to an LLM.
"""

from __future__ import annotations

import re

from pmkit_mcp.workflows.registry import WorkflowDefinition


def render_prompt(
    workflow: WorkflowDefinition,
    context: dict[str, str],
) -> tuple[str, str]:
    """Render a workflow's prompts by substituting context values into placeholders.

    Args:
        workflow: The workflow definition to render.
        context: Mapping of field names to user-provided values.

    Returns:
        A (system_prompt, user_prompt) tuple with all ``{{placeholders}}`` replaced.
        Missing optional fields are replaced with ``(not provided)``.
    """
    user_prompt = workflow.user_prompt_template

    # Collect all placeholder names from the template
    placeholders = set(re.findall(r"\{\{(\w+)\}\}", user_prompt))

    for key in placeholders:
        value = context.get(key, "(not provided)")
        user_prompt = user_prompt.replace("{{" + key + "}}", value)

    return workflow.system_prompt, user_prompt


def build_missing_fields_message(
    workflow: WorkflowDefinition,
    provided: dict[str, str],
) -> str | None:
    """Check which required fields are missing and return a human-readable message.

    Args:
        workflow: The workflow definition.
        provided: Context values provided so far.

    Returns:
        A message listing missing required fields, or ``None`` if all are present.
    """
    missing = [
        f for f in workflow.required_fields if f.name not in provided or not provided[f.name]
    ]
    if not missing:
        return None

    lines = ["The following required fields are missing:\n"]
    for f in missing:
        example_hint = f" (e.g. \"{f.example}\")" if f.example else ""
        lines.append(f"  - **{f.name}**: {f.description}{example_hint}")

    lines.append(
        "\nPlease provide these values and call the tool again with all required fields."
    )
    return "\n".join(lines)


def build_field_summary(workflow: WorkflowDefinition) -> str:
    """Build a human-readable summary of a workflow's fields for the help output."""
    lines = [f"## {workflow.name}\n", f"{workflow.description}\n"]

    if workflow.required_fields:
        lines.append("**Required fields:**")
        for f in workflow.required_fields:
            example = f" _(e.g. \"{f.example}\")_" if f.example else ""
            lines.append(f"  - `{f.name}`: {f.description}{example}")

    if workflow.optional_fields:
        lines.append("\n**Optional fields** (enhance output if provided):")
        for f in workflow.optional_fields:
            example = f" _(e.g. \"{f.example}\")_" if f.example else ""
            lines.append(f"  - `{f.name}`: {f.description}{example}")

    lines.append(f"\n**Output format:** {workflow.output_format}")
    lines.append(f"**Category:** {workflow.category}")
    return "\n".join(lines)
