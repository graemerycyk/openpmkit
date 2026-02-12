"""Tests for the workflow registry definitions."""

from __future__ import annotations

import re

from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY, FieldSpec, WorkflowDefinition


def test_registry_has_13_workflows() -> None:
    """Verify the registry contains exactly 13 workflows."""
    assert len(WORKFLOW_REGISTRY) == 13


def test_all_expected_workflow_ids_present() -> None:
    """Every documented workflow ID must appear in the registry."""
    expected = {
        "daily_brief",
        "meeting_prep",
        "voc_clustering",
        "competitor_research",
        "roadmap_alignment",
        "prd_draft",
        "sprint_review",
        "prototype_generation",
        "release_notes",
        "deck_content",
        "feature_ideation",
        "one_pager",
        "tldr",
    }
    assert set(WORKFLOW_REGISTRY.keys()) == expected


def test_workflow_ids_match_keys() -> None:
    """Each workflow's .id must match its key in the registry dict."""
    for key, workflow in WORKFLOW_REGISTRY.items():
        assert key == workflow.id, f"Key {key!r} != workflow.id {workflow.id!r}"


def test_every_workflow_has_required_attributes() -> None:
    """Every workflow must have non-empty name, description, system_prompt, and template."""
    for wf in WORKFLOW_REGISTRY.values():
        assert wf.name, f"{wf.id}: missing name"
        assert wf.description, f"{wf.id}: missing description"
        assert wf.system_prompt, f"{wf.id}: missing system_prompt"
        assert wf.user_prompt_template, f"{wf.id}: missing user_prompt_template"


def test_template_placeholders_covered_by_fields() -> None:
    """Every {{placeholder}} in a template must correspond to a required or optional field."""
    for wf in WORKFLOW_REGISTRY.values():
        placeholders = set(re.findall(r"\{\{(\w+)\}\}", wf.user_prompt_template))
        field_names = {f.name for f in (*wf.required_fields, *wf.optional_fields)}
        uncovered = placeholders - field_names
        assert not uncovered, f"{wf.id}: placeholders {uncovered} have no matching field"


def test_category_values_are_valid() -> None:
    """Category must be one of the three allowed values."""
    valid = {"autonomous", "on-demand", "beta"}
    for wf in WORKFLOW_REGISTRY.values():
        assert wf.category in valid, f"{wf.id}: invalid category {wf.category!r}"


def test_output_format_values_are_valid() -> None:
    """Output format must be markdown or html."""
    valid = {"markdown", "html"}
    for wf in WORKFLOW_REGISTRY.values():
        assert wf.output_format in valid, f"{wf.id}: invalid output_format {wf.output_format!r}"


def test_field_specs_have_descriptions() -> None:
    """Every FieldSpec must have a non-empty description."""
    for wf in WORKFLOW_REGISTRY.values():
        for field in (*wf.required_fields, *wf.optional_fields):
            assert field.description, f"{wf.id}.{field.name}: missing description"
