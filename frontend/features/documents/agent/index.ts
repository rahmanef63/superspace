import { AgentDefinition } from "../../ai/types";
import { prompts } from "./prompts";

export const agent: AgentDefinition = {
    name: "Documents Agent",
    description: "Manage documents - create, search, read, update, and delete.",
    icon: "FileText",
    capabilities: ["create", "read", "update", "delete", "search"],
    prompts: prompts
};
