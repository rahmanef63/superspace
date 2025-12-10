/**
 * Retail Chain Workspace Configuration
 * F&B, Hospitality, Multi-branch Retail
 */

import type { WorkspaceConfig } from "../types";

export const retailConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-retail",
        name: "FreshMart Chain",
        slug: "retail",
        description: "Multi-branch retail management",
        icon: "ShoppingBag",
        color: "#f97316",
        children: [
            {
                id: "ws-retail-branch-downtown",
                name: "Downtown Branch",
                slug: "branch-downtown",
                icon: "Store",
                parentId: "ws-retail",
            },
            {
                id: "ws-retail-branch-mall",
                name: "Mall Branch",
                slug: "branch-mall",
                icon: "Store",
                parentId: "ws-retail",
            },
            {
                id: "ws-retail-warehouse",
                name: "Central Warehouse",
                slug: "central-warehouse",
                icon: "Container",
                parentId: "ws-retail",
            },
            {
                id: "ws-retail-marketing",
                name: "Marketing Hub",
                slug: "marketing-hub",
                icon: "Target",
                parentId: "ws-retail",
            },
        ],
    },
    menuItems: [
        { id: "m-retail-pos", label: "POS System", slug: "sales", icon: "CreditCard" },
        { id: "m-retail-inventory", label: "Inventory", slug: "inventory", icon: "Package" },
        { id: "m-retail-analytics", label: "Sales Analytics", slug: "analytics", icon: "LineChart" },
        { id: "m-retail-tasks", label: "Shift Management", slug: "tasks", icon: "ClipboardCheck" },
        { id: "m-retail-calendar", label: "Staff Roster", slug: "calendar", icon: "CalendarDays" },
        { id: "m-retail-marketing", label: "Campaigns", slug: "projects", icon: "Megaphone" },
    ],
    enabledFeatures: [
        "sales",
        "inventory",
        "analytics",
        "tasks",
        "calendar",
        "projects",
        "notifications",
    ],
};
