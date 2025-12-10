/**
 * Personal Productivity Workspace Configuration
 * Freelancers, Solopreneurs, Content Creators
 */

import type { WorkspaceConfig } from "../types";

export const personalConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-personal",
        name: "Alex's Studio",
        slug: "personal",
        description: "Personal productivity and freelance hub",
        icon: "User",
        color: "#8b5cf6",
        children: [
            {
                id: "ws-personal-knowledge",
                name: "Second Brain",
                slug: "knowledge-base",
                icon: "Brain",
                parentId: "ws-personal",
            },
            {
                id: "ws-personal-finance",
                name: "Finance Tracker",
                slug: "finance",
                icon: "PiggyBank",
                parentId: "ws-personal",
            },
            {
                id: "ws-personal-clients",
                name: "Client Space",
                slug: "clients",
                icon: "Briefcase",
                parentId: "ws-personal",
            },
            {
                id: "ws-personal-content",
                name: "Content Creation",
                slug: "content",
                icon: "PenTool",
                parentId: "ws-personal",
            },
        ],
    },
    menuItems: [
        { id: "m-personal-calendar", label: "My Schedule", slug: "calendar", icon: "Calendar" },
        { id: "m-personal-tasks", label: "To-Do List", slug: "tasks", icon: "CheckCircle" },
        { id: "m-personal-clients", label: "Client CRM", slug: "crm", icon: "Users" },
        { id: "m-personal-notes", label: "Notes & Ideas", slug: "documents", icon: "StickyNote" },
        { id: "m-personal-content", label: "Content Planner", slug: "projects", icon: "Trello" },
        { id: "m-personal-ai", label: "AI Brain", slug: "ai", icon: "Sparkles" },
    ],
    enabledFeatures: [
        "calendar",
        "tasks",
        "crm",
        "documents",
        "projects",
        "ai",
        "knowledge",
    ],
};
