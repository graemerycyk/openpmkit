"""PM Kit MCP Server.

A Model Context Protocol server that exposes 13 product management workflows
as tools, plus a ``pmkit_help`` tool for discovering available workflows.

Each workflow tool follows a conversational pattern:
1. If required fields are missing, the tool returns a message listing them.
2. Once all required fields are provided, it renders the prompt and returns it.

The rendered prompts (system + user) are returned to the MCP client so that
the LLM host can use them directly. This keeps the server stateless and
avoids coupling to any specific LLM provider.

Usage:
    # stdio transport (default, for Claude Desktop / Cursor / etc.)
    python -m pmkit_mcp.server

    # Or via the installed entry point
    pmkit-mcp
"""

from __future__ import annotations

import json
import logging
import sys
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

from pmkit_mcp.renderer import (
    build_field_summary,
    build_missing_fields_message,
    render_prompt,
)
from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY, WorkflowDefinition

logger = logging.getLogger("pmkit_mcp")

# ---------------------------------------------------------------------------
# Tool schema builders
# ---------------------------------------------------------------------------


def _build_tool_schema(workflow: WorkflowDefinition) -> dict[str, Any]:
    """Build a JSON Schema for a workflow tool's input parameters."""
    properties: dict[str, Any] = {}
    required: list[str] = []

    for field in workflow.required_fields:
        properties[field.name] = {
            "type": "string",
            "description": field.description + (f" (e.g. {field.example})" if field.example else ""),
        }
        required.append(field.name)

    for field in workflow.optional_fields:
        properties[field.name] = {
            "type": "string",
            "description": field.description + (f" (e.g. {field.example})" if field.example else ""),
        }

    return {
        "type": "object",
        "properties": properties,
        "required": required,
    }


def _build_help_text() -> str:
    """Build the full help text listing all available workflows."""
    lines = [
        "# PM Kit MCP Server - Available Tools\n",
        "This server provides 13 product management workflow tools.\n"
        "Each tool generates a structured prompt ready for LLM processing.\n",
        "---\n",
    ]

    categories: dict[str, list[WorkflowDefinition]] = {
        "autonomous": [],
        "on-demand": [],
        "beta": [],
    }
    for w in WORKFLOW_REGISTRY.values():
        categories.setdefault(w.category, []).append(w)

    category_labels = {
        "autonomous": "Autonomous Agents (run on schedule)",
        "on-demand": "On-Demand Workflows",
        "beta": "Beta Workflows",
    }

    for cat_key, label in category_labels.items():
        workflows = categories.get(cat_key, [])
        if not workflows:
            continue
        lines.append(f"## {label}\n")
        for w in workflows:
            lines.append(f"### `{w.id}`")
            lines.append(f"{w.description}\n")
            req_names = ", ".join(f"`{f.name}`" for f in w.required_fields) or "(none)"
            opt_names = ", ".join(f"`{f.name}`" for f in w.optional_fields) or "(none)"
            lines.append(f"- **Required:** {req_names}")
            lines.append(f"- **Optional:** {opt_names}")
            lines.append(f"- **Output:** {w.output_format}\n")

    lines.append("---\n")
    lines.append(
        "**Tip:** Call any tool without arguments to see its required and optional fields. "
        "Provide all required fields to get a fully rendered prompt.\n"
    )
    lines.append(
        "**Tip:** Use `pmkit_workflow_details` with a `workflow_id` to see full field "
        "descriptions for a specific workflow."
    )
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Server setup
# ---------------------------------------------------------------------------


def create_server() -> Server:
    """Create and configure the PM Kit MCP server with all tools registered."""
    server = Server("pmkit-mcp-server")

    @server.list_tools()
    async def list_tools() -> list[Tool]:
        tools: list[Tool] = []

        # Help tool
        tools.append(
            Tool(
                name="pmkit_help",
                description=(
                    "List all available PM Kit workflow tools with their required "
                    "and optional fields. Start here to discover what's available."
                ),
                inputSchema={"type": "object", "properties": {}, "required": []},
            )
        )

        # Workflow details tool
        tools.append(
            Tool(
                name="pmkit_workflow_details",
                description=(
                    "Get detailed field descriptions and examples for a specific workflow. "
                    "Use this to understand exactly what data a workflow needs."
                ),
                inputSchema={
                    "type": "object",
                    "properties": {
                        "workflow_id": {
                            "type": "string",
                            "description": "The workflow ID to get details for",
                            "enum": list(WORKFLOW_REGISTRY.keys()),
                        }
                    },
                    "required": ["workflow_id"],
                },
            )
        )

        # One tool per workflow
        for workflow in WORKFLOW_REGISTRY.values():
            tools.append(
                Tool(
                    name=workflow.id,
                    description=workflow.description,
                    inputSchema=_build_tool_schema(workflow),
                )
            )

        return tools

    @server.call_tool()
    async def call_tool(name: str, arguments: dict[str, Any] | None) -> list[TextContent]:
        arguments = arguments or {}

        # --- Help tool ---
        if name == "pmkit_help":
            return [TextContent(type="text", text=_build_help_text())]

        # --- Workflow details tool ---
        if name == "pmkit_workflow_details":
            wf_id = arguments.get("workflow_id", "")
            if wf_id not in WORKFLOW_REGISTRY:
                available = ", ".join(sorted(WORKFLOW_REGISTRY.keys()))
                return [
                    TextContent(
                        type="text",
                        text=f"Unknown workflow: `{wf_id}`. Available: {available}",
                    )
                ]
            return [
                TextContent(
                    type="text",
                    text=build_field_summary(WORKFLOW_REGISTRY[wf_id]),
                )
            ]

        # --- Workflow tools ---
        if name not in WORKFLOW_REGISTRY:
            return [
                TextContent(
                    type="text",
                    text=(
                        f"Unknown tool: `{name}`. "
                        f"Call `pmkit_help` to see available tools."
                    ),
                )
            ]

        workflow = WORKFLOW_REGISTRY[name]

        # Conversational pattern: if required fields missing, ask for them
        missing_msg = build_missing_fields_message(workflow, arguments)
        if missing_msg:
            return [TextContent(type="text", text=missing_msg)]

        # All required fields present: render the prompt
        system_prompt, user_prompt = render_prompt(workflow, arguments)

        # Return structured output so the client can use system + user prompts
        result = {
            "workflow": workflow.name,
            "output_format": workflow.output_format,
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
        }

        return [
            TextContent(
                type="text",
                text=json.dumps(result, indent=2),
            )
        ]

    return server


async def run_server() -> None:
    """Run the MCP server using stdio transport."""
    server = create_server()
    options = server.create_initialization_options()

    async with stdio_server() as (read_stream, write_stream):
        logger.info("PM Kit MCP Server starting on stdio...")
        await server.run(read_stream, write_stream, options)


def main() -> None:
    """Entry point for the pmkit-mcp command."""
    import asyncio

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        stream=sys.stderr,
    )
    asyncio.run(run_server())


if __name__ == "__main__":
    main()
