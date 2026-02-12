"""Tests for the prompt renderer."""

from __future__ import annotations

from pmkit_mcp.renderer import (
    build_field_summary,
    build_missing_fields_message,
    render_prompt,
)
from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY


def test_render_prompt_replaces_placeholders() -> None:
    """Provided context values must replace {{placeholders}} in the template."""
    wf = WORKFLOW_REGISTRY["daily_brief"]
    context = {
        "user_name": "Alice",
        "tenant_name": "Acme",
        "current_date": "2026-01-15",
    }
    system, user = render_prompt(wf, context)
    assert "Alice" in user
    assert "Acme" in user
    assert "2026-01-15" in user
    assert system == wf.system_prompt


def test_render_prompt_missing_optional_shows_not_provided() -> None:
    """Optional fields not supplied should render as '(not provided)'."""
    wf = WORKFLOW_REGISTRY["daily_brief"]
    context = {
        "user_name": "Alice",
        "tenant_name": "Acme",
        "current_date": "2026-01-15",
    }
    _, user = render_prompt(wf, context)
    assert "(not provided)" in user


def test_build_missing_fields_message_all_present() -> None:
    """When all required fields are provided, message should be None."""
    wf = WORKFLOW_REGISTRY["daily_brief"]
    context = {
        "user_name": "Alice",
        "tenant_name": "Acme",
        "current_date": "2026-01-15",
    }
    assert build_missing_fields_message(wf, context) is None


def test_build_missing_fields_message_some_missing() -> None:
    """When required fields are missing, message should list them."""
    wf = WORKFLOW_REGISTRY["daily_brief"]
    context = {"user_name": "Alice"}
    msg = build_missing_fields_message(wf, context)
    assert msg is not None
    assert "tenant_name" in msg
    assert "current_date" in msg


def test_build_missing_fields_message_empty_values_treated_as_missing() -> None:
    """Empty string values for required fields should be treated as missing."""
    wf = WORKFLOW_REGISTRY["daily_brief"]
    context = {"user_name": "Alice", "tenant_name": "", "current_date": "2026-01-15"}
    msg = build_missing_fields_message(wf, context)
    assert msg is not None
    assert "tenant_name" in msg


def test_build_field_summary_includes_required_and_optional() -> None:
    """Field summary should mention both required and optional fields."""
    wf = WORKFLOW_REGISTRY["prd_draft"]
    summary = build_field_summary(wf)
    assert "Required" in summary
    assert "Optional" in summary
    assert "feature_name" in summary
    assert "epic_key" in summary
