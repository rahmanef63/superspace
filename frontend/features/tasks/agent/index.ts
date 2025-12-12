import { AgentDefinition } from "../../ai/types";

export const agent: AgentDefinition = {
    name: "Tasks Agent",
    description: "Manage tasks - create, list, complete, update, and delete.",
    icon: "CheckSquare",
    capabilities: ["create", "read", "update", "delete", "search"],
    prompts: {
        system: `You are a task management assistant. You help users create, list, complete, update, and delete tasks.

When a user wants to create a task, always ask for or infer:
1. Task title (required)
2. Description (optional but helpful)
3. Priority (low, medium, high - default to medium)
4. Due date if mentioned

When listing tasks, summarize them clearly with their status and priority.
When completing tasks, confirm the action was successful.`
    }
};

// Re-export the SubAgent for frontend registry
export { tasksAgent } from "./tasks-agent";
