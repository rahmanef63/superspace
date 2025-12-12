// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

import { FeatureAgent } from "./lib/types";
import { agent as documentsAgent } from "../docs/agent";
import { agent as calendarAgent } from "../calendar/agent";
import { agent as tasksAgent } from "../tasks/agent";

export const featureAgentRegistry: Record<string, FeatureAgent> = {
  "documents": documentsAgent,
  "calendar": calendarAgent,
  "tasks": tasksAgent,
};
