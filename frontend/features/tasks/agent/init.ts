/**
 * Tasks Agent Initialization
 * 
 * Registers the Tasks Agent with the sub-agent registry.
 * Import this file to enable the Tasks Agent.
 */

import { subAgentRegistry } from "@/frontend/features/ai/agents";
import { tasksAgent } from "./tasks-agent";

// Register the tasks agent with high priority
subAgentRegistry.register(tasksAgent, {
    priority: 8,
    enabled: true,
});

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("✅ Tasks Agent registered with sub-agent registry");
}

export { tasksAgent };
