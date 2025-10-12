# (Optional) Orchestrator

## Usage
Run agents in order:
1) crud_workspaces
2) crud_roles
3) crud_users
4) crud_documents
5) crud_menu_items
6) component_registry_manager
7) crud_conversations
8) crud_db_tables
9) global_settings_manager

Command tips:
- `@Claude run .claude/agents/crud_workspaces.task.md`
- Then `/test` and fix until green, move next.