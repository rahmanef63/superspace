// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

// Defines the frontend metadata for agents
export interface AgentFallback {
    name: string;
    description: string;
    icon: string;
    prompts?: any;
}

import { agent as documentsFrontend } from "../documents/agent/index";
import { agent as calendarFrontend } from "../calendar/agent/index";
import { agent as tasksFrontend } from "../tasks/agent/index";

export const frontendAgentRegistry: Record<string, any> = {
  "documents": documentsFrontend,
  "calendar": calendarFrontend,
  "tasks": tasksFrontend,
};
