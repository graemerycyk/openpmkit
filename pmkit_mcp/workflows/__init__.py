"""PM Kit workflow definitions.

Each workflow is a self-contained prompt template with:
- System prompt for the LLM
- User prompt template with placeholders
- Required and optional context fields
- Output format specification
"""

from pmkit_mcp.workflows.registry import WORKFLOW_REGISTRY, WorkflowDefinition

__all__ = ["WORKFLOW_REGISTRY", "WorkflowDefinition"]
