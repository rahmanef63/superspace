// AUTO-GENERATED - DO NOT EDIT
// Run 'pnpm run syncagent:all' to update

import { FeatureAgent } from "./lib/types";
import { agent as documentsAgent } from "../docs/agent";
import { agent as calendarAgent } from "../calendar/agent";
import { agent as tasksAgent } from "../tasks/agent";
import { agent as analyticsAgent } from "../analytics/agent";
import { agent as projectsAgent } from "../projects/agent";
import { agent as crmAgent } from "../crm/agent";

export const featureAgentRegistry: Record<string, FeatureAgent> = {
  "documents": documentsAgent,
  "calendar": calendarAgent,
  "tasks": tasksAgent,
  "analytics": analyticsAgent,
  "projects": projectsAgent,
  "crm": crmAgent,
};
