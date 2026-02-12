---
description: Configure your company context for OpenPMKit workflows
argument-hint: [field to update]
---

If the user provided a specific field to update with the command, use it here: "$ARGUMENTS"
If a field name was provided (e.g., "company name", "product name"), only update that specific field and keep all other stored values.

When the user invokes this command, guide them through configuring persistent context that will be reused across all OpenPMKit workflows. This saves them from re-entering company name, their name, and other common details every time.

## Setup Flow

### Step 1: Ask for Core Information

Collect the following fields one at a time in a conversational manner:

1. **Company Name** (tenant_name): The user's organization name (e.g., "Acme Corp")
2. **Your Name** (user_name): The user's name for briefs and reports (e.g., "Jane Smith")
3. **Product Name** (product_name): The product they manage (e.g., "Acme Platform")

### Step 2: Ask for Optional Context

These are helpful but not required:

4. **Your Role**: Their title or role (e.g., "Senior PM", "Group PM")
5. **Jira Project Key**: Their Jira project prefix (e.g., "ACME")
6. **Team Name**: Their team name (e.g., "Search Pod", "Platform Team")

### Step 3: Confirm and Store

After collecting the information:

1. Display a summary of all configured values in a clean table
2. Confirm with the user that everything looks correct
3. Remember these values for the rest of the conversation
4. Let the user know these will be automatically populated in future workflow commands

### Updating Individual Fields

If the user invokes `/pmkit-setup` with a specific field name (e.g., `/pmkit-setup company name`), only ask for that specific field and update it while keeping all other stored values.

## Example Interaction

User: `/pmkit-setup`