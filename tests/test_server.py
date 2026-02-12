"""Integration tests for the MCP server tool registration and dispatch."""

from __future__ import annotations

import json

import pytest

from mcp.types import CallToolRequest, CallToolRequestParams, ListToolsRequest

from pmkit_mcp.server import create_server
from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY


@pytest.fixture
def server():
    return create_server()


async def _list_tools(server):
    """Helper: invoke the list_tools handler and return the tool list."""
    handler = server.request_handlers[ListToolsRequest]
    result = await handler(ListToolsRequest(method="tools/list"))
    return result.root.tools


async def _call_tool(server, name: str, arguments: dict | None = None):
    """Helper: invoke the call_tool handler and return the content list."""
    handler = server.request_handlers[CallToolRequest]
    result = await handler(
        CallToolRequest(
            method="tools/call",
            params=CallToolRequestParams(name=name, arguments=arguments or {}),
        )
    )
    return result.root.content


async def test_list_tools(server) -> None:
    """Server should expose exactly 15 tools (13 workflows + 2 utility)."""
    tools = await _list_tools(server)
    assert len(tools) == 15


async def test_list_tools_contains_help(server) -> None:
    """pmkit_help must be in the tool list."""
    tools = await _list_tools(server)
    names = {t.name for t in tools}
    assert "pmkit_help" in names


async def test_list_tools_contains_workflow_details(server) -> None:
    """pmkit_workflow_details must be in the tool list."""
    tools = await _list_tools(server)
    names = {t.name for t in tools}
    assert "pmkit_workflow_details" in names


async def test_list_tools_contains_all_workflows(server) -> None:
    """Every registered workflow must appear as a tool."""
    tools = await _list_tools(server)
    names = {t.name for t in tools}
    for wf_id in WORKFLOW_REGISTRY:
        assert wf_id in names, f"Workflow {wf_id!r} not in tool list"


async def test_call_pmkit_help(server) -> None:
    """pmkit_help should return help text listing workflows."""
    content = await _call_tool(server, "pmkit_help")
    assert len(content) == 1
    text = content[0].text
    assert "PM Kit" in text
    assert "daily_brief" in text


async def test_call_workflow_details_valid(server) -> None:
    """pmkit_workflow_details with a valid ID returns field summary."""
    content = await _call_tool(server, "pmkit_workflow_details", {"workflow_id": "prd_draft"})
    assert len(content) == 1
    text = content[0].text
    assert "PRD Draft" in text
    assert "feature_name" in text


async def test_call_workflow_details_invalid(server) -> None:
    """pmkit_workflow_details with an invalid ID returns an error message."""
    content = await _call_tool(server, "pmkit_workflow_details", {"workflow_id": "nonexistent"})
    text = content[0].text
    # The MCP SDK may validate the enum itself, producing a validation error,
    # or our handler may catch it and return "Unknown workflow".
    assert "nonexistent" in text


async def test_call_workflow_missing_required_fields(server) -> None:
    """Calling a workflow without required fields returns guidance."""
    content = await _call_tool(server, "daily_brief")
    text = content[0].text
    assert "required fields are missing" in text.lower() or "required" in text.lower()


async def test_call_workflow_with_all_required_fields(server) -> None:
    """Calling a workflow with all required fields returns rendered prompt JSON."""
    content = await _call_tool(
        server,
        "daily_brief",
        {
            "user_name": "Alice",
            "tenant_name": "Acme",
            "current_date": "2026-01-15",
        },
    )
    text = content[0].text
    data = json.loads(text)
    assert "system_prompt" in data
    assert "user_prompt" in data
    assert "Alice" in data["user_prompt"]


async def test_call_unknown_tool(server) -> None:
    """Calling an unknown tool returns a helpful error."""
    content = await _call_tool(server, "not_a_real_tool")
    text = content[0].text
    assert "Unknown tool" in text
