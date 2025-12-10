/**
 * Construction Workspace Configuration
 * Property Developers, Interior Design Firms
 */

import type { WorkspaceConfig } from "../types";

export const constructionConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-construction",
        name: "BuildRight Construction",
        slug: "construction",
        description: "Construction and property development",
        icon: "HardHat",
        color: "#eab308",
        children: [
            {
                id: "ws-const-project-1",
                name: "Sky Highrise",
                slug: "project-highrise",
                icon: "Building",
                parentId: "ws-construction",
            },
            {
                id: "ws-const-project-2",
                name: "Villa Renovation",
                slug: "project-renovation",
                icon: "Home",
                parentId: "ws-construction",
            },
            {
                id: "ws-const-procurement",
                name: "Procurement",
                slug: "procurement",
                icon: "Truck",
                parentId: "ws-construction",
            },
            {
                id: "ws-const-vendors",
                name: "Vendor Management",
                slug: "vendors",
                icon: "Users",
                parentId: "ws-construction",
            },
        ],
    },
    menuItems: [
        { id: "m-const-projects", label: "Site Projects", slug: "projects", icon: "FolderKanban" },
        { id: "m-const-blueprints", label: "Blueprints", slug: "documents", icon: "Map" },
        { id: "m-const-tasks", label: "Field Tasks", slug: "tasks", icon: "CheckSquare" },
        { id: "m-const-approvals", label: "Material Approvals", slug: "approvals", icon: "FileCheck" },
        { id: "m-const-budget", label: "Project Budget", slug: "accounting", icon: "DollarSign" },
        { id: "m-const-clients", label: "Client Updates", slug: "crm", icon: "MessageSquare" },
    ],
    enabledFeatures: [
        "projects",
        "documents",
        "tasks",
        "approvals",
        "accounting",
        "crm",
        "calendar",
    ],
};
