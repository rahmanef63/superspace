/**
 * NGO / Foundation Workspace Configuration
 * Non-profit, Social Organizations
 */

import type { WorkspaceConfig } from "../types";

export const ngoConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-ngo",
        name: "Global Hope Foundation",
        slug: "ngo",
        description: "Humanitarian aid and social programs",
        icon: "HeartHandshake",
        color: "#10b981",
        children: [
            {
                id: "ws-ngo-program-a",
                name: "Clean Water Program",
                slug: "clean-water",
                icon: "Droplets",
                parentId: "ws-ngo",
            },
            {
                id: "ws-ngo-volunteers",
                name: "Volunteer Management",
                slug: "volunteers",
                icon: "Users2",
                parentId: "ws-ngo",
            },
            {
                id: "ws-ngo-donors",
                name: "Donor Relations",
                slug: "donor-relations",
                icon: "Heart",
                parentId: "ws-ngo",
            },
            {
                id: "ws-ngo-grants",
                name: "Finance & Grants",
                slug: "grants",
                icon: "Coins",
                parentId: "ws-ngo",
            },
        ],
    },
    menuItems: [
        { id: "m-ngo-donors", label: "Donor CRM", slug: "crm", icon: "Heart" },
        { id: "m-ngo-projects", label: "Social Programs", slug: "projects", icon: "FolderHeart" },
        { id: "m-ngo-volunteers", label: "Volunteers", slug: "contacts", icon: "Contact" },
        { id: "m-ngo-reports", label: "Impact Reports", slug: "analytics", icon: "PieChart" },
        { id: "m-ngo-knowledge", label: "SOPs & Guides", slug: "knowledge", icon: "BookOpen" },
        { id: "m-ngo-calendar", label: "Events Calendar", slug: "calendar", icon: "CalendarHeart" },
    ],
    enabledFeatures: [
        "crm",
        "projects",
        "contacts",
        "analytics",
        "knowledge",
        "calendar",
        "documents",
    ],
};
