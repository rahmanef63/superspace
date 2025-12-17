/**
 * Sub-Agent Initialization
 * 
 * This file initializes all sub-agents by importing their init modules.
 * Import this file early in the application lifecycle to register all agents.
 */

// Import agent init modules to register them
import "@/frontend/features/documents/agent/init";
import "@/frontend/features/tasks/agent/init";
import "@/frontend/features/calendar/agent/init";
// Future agents:
// import "@/frontend/features/crm/agent/init";
// import "@/frontend/features/knowledge/agent/init";


import { subAgentRegistry } from "./agents";

// Mark registry as initialized after all agents are registered
if (typeof window !== "undefined") {
    // Use setTimeout to ensure all imports have completed
    setTimeout(() => {
        subAgentRegistry.markInitialized();
        if (process.env.NODE_ENV === "development") {
            const agents = subAgentRegistry.getAllAgents();
            for (const agent of agents) {
            }
        }
    }, 0);
}

export { subAgentRegistry };
