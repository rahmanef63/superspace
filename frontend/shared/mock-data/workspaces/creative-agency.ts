/**
 * Creative Agency Workspace Configuration
 * Design Studios, Media Companies, Software Houses
 */

import type { WorkspaceConfig } from "../types";

export const creativeAgencyConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-creative",
        name: "Pixel Perfect Studio",
        slug: "creative",
        description: "Creative design and media production studio",
        icon: "Palette",
        color: "#ec4899",
        children: [
            {
                id: "ws-creative-client-a",
                name: "Client A Workspace",
                slug: "client-a",
                icon: "Briefcase",
                parentId: "ws-creative",
            },
            {
                id: "ws-creative-client-b",
                name: "Client B Workspace",
                slug: "client-b",
                icon: "Briefcase",
                parentId: "ws-creative",
            },
            {
                id: "ws-creative-internal",
                name: "Internal Design Team",
                slug: "internal-design",
                icon: "PenTool",
                parentId: "ws-creative",
            },
            {
                id: "ws-creative-production",
                name: "Content Production Hub",
                slug: "production",
                icon: "Video",
                parentId: "ws-creative",
            },
        ],
    },
    menuItems: [
        { id: "m-creative-projects", label: "Projects", slug: "projects", icon: "FolderKanban" },
        { id: "m-creative-tasks", label: "My Tasks", slug: "tasks", icon: "CheckSquare" },
        { id: "m-creative-calendar", label: "Schedule", slug: "calendar", icon: "Calendar" },
        { id: "m-creative-comms", label: "Team Chat", slug: "communications", icon: "MessageCircle", badge: 3 },
        { id: "m-creative-assets", label: "Asset Library", slug: "documents", icon: "Image" },
        { id: "m-creative-knowledge", label: "Brand Guidelines", slug: "knowledge", icon: "Book" },
        { id: "m-creative-approvals", label: "Client Invoices", slug: "approvals", icon: "FileCheck" },
    ],
    enabledFeatures: [
        "projects",
        "tasks",
        "calendar",
        "communications",
        "documents",
        "knowledge",
        "approvals",
    ],
};
