/**
 * Corporate Workspace Configuration
 * Small-to-Enterprise companies (Service, Manufacturing, Retail, Consulting)
 */

import type { WorkspaceConfig } from "../types";

export const corporateConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-corporate",
        name: "Acme Corp Global",
        slug: "corporate",
        description: "Global enterprise management workspace",
        icon: "Building2",
        color: "#0f172a",
        children: [
            {
                id: "ws-corp-hr",
                name: "HR Department",
                slug: "hr-dept",
                icon: "Users",
                parentId: "ws-corporate",
            },
            {
                id: "ws-corp-finance",
                name: "Finance Dept",
                slug: "finance",
                icon: "Banknote",
                parentId: "ws-corporate",
            },
            {
                id: "ws-corp-sales",
                name: "Sales & Marketing",
                slug: "sales-marketing",
                icon: "TrendingUp",
                parentId: "ws-corporate",
            },
            {
                id: "ws-corp-ops",
                name: "Operations",
                slug: "operations",
                icon: "Settings",
                parentId: "ws-corporate",
            },
            {
                id: "ws-corp-warehouse",
                name: "Warehouse",
                slug: "warehouse",
                icon: "Package",
                parentId: "ws-corporate",
            },
        ],
    },
    menuItems: [
        { id: "m-corp-overview", label: "Overview", slug: "overview", icon: "LayoutDashboard" },
        { id: "m-corp-projects", label: "Projects", slug: "projects", icon: "FolderKanban" },
        { id: "m-corp-crm", label: "CRM", slug: "crm", icon: "Users" },
        { id: "m-corp-sales", label: "Sales", slug: "sales", icon: "TrendingUp" },
        { id: "m-corp-inventory", label: "Inventory", slug: "inventory", icon: "Package" },
        { id: "m-corp-hr", label: "HR Portal", slug: "hr", icon: "Briefcase" },
        { id: "m-corp-tasks", label: "Tasks", slug: "tasks", icon: "CheckSquare", badge: "5 Urgent" },
        { id: "m-corp-accounting", label: "Accounting", slug: "accounting", icon: "Calculator" },
        { id: "m-corp-analytics", label: "Business Intelligence", slug: "analytics", icon: "BarChart3" },
        { id: "m-corp-approvals", label: "Approvals", slug: "approvals", icon: "FileCheck" },
    ],
    enabledFeatures: [
        "overview",
        "projects",
        "crm",
        "sales",
        "inventory",
        "hr",
        "tasks",
        "accounting",
        "analytics",
        "approvals",
        "communications",
    ],
};
