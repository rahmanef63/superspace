/**
 * Government Office Workspace Configuration
 * Public Service Units, Licensing Departments
 */

import type { WorkspaceConfig } from "../types";

export const governmentConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-government",
        name: "City Public Services",
        slug: "government",
        description: "Public service and licensing department",
        icon: "Landmark",
        color: "#d946ef",
        children: [
            {
                id: "ws-gov-licensing",
                name: "Licensing Dept",
                slug: "licensing",
                icon: "Stamp",
                parentId: "ws-government",
            },
            {
                id: "ws-gov-pr",
                name: "Public Relations",
                slug: "public-relations",
                icon: "Megaphone",
                parentId: "ws-government",
            },
            {
                id: "ws-gov-treasury",
                name: "Treasury",
                slug: "treasury",
                icon: "Landmark",
                parentId: "ws-government",
            },
            {
                id: "ws-gov-infra",
                name: "Infrastructure",
                slug: "infrastructure",
                icon: "Construction",
                parentId: "ws-government",
            },
        ],
    },
    menuItems: [
        { id: "m-gov-permit", label: "Permit Approvals", slug: "approvals", icon: "FileCheck" },
        { id: "m-gov-docs", label: "Official Documents", slug: "documents", icon: "FileText" },
        { id: "m-gov-audit", label: "Audit Logs", slug: "overview", icon: "ShieldCheck" },
        { id: "m-gov-projects", label: "Public Projects", slug: "projects", icon: "FolderKanban" },
        { id: "m-gov-forms", label: "Citizen Forms", slug: "forms", icon: "ClipboardList" },
        { id: "m-gov-helpdesk", label: "Citizen Support", slug: "support", icon: "LifeBuoy" },
    ],
    enabledFeatures: [
        "approvals",
        "documents",
        "overview",
        "projects",
        "forms",
        "support",
        "tasks",
    ],
};
