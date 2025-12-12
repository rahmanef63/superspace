/**
 * Calendar Agent Initialization
 * 
 * Registers the Calendar Agent with the sub-agent registry.
 * Import this file to enable the Calendar Agent.
 */

import { subAgentRegistry } from "@/frontend/features/ai/agents";
import { calendarAgent } from "./calendar-agent";

// Register the calendar agent with high priority
subAgentRegistry.register(calendarAgent, {
    priority: 8,
    enabled: true,
});

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("✅ Calendar Agent registered with sub-agent registry");
}

export { calendarAgent };
