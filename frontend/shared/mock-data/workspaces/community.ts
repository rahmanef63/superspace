/**
 * Community Workspace Configuration
 * Clubs, Societies, Social Groups
 */

import type { WorkspaceConfig } from "../types";

export const communityConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-community",
        name: "Tech Enthusiasts Club",
        slug: "community",
        description: "Community hub for tech lovers",
        icon: "Users2",
        color: "#f43f5e",
        children: [
            {
                id: "ws-comm-committee",
                name: "Committee",
                slug: "committee",
                icon: "Gavel",
                parentId: "ws-community",
            },
            {
                id: "ws-comm-events",
                name: "Event Team",
                slug: "events-team",
                icon: "PartyPopper",
                parentId: "ws-community",
            },
            {
                id: "ws-comm-membership",
                name: "Membership Mgmt",
                slug: "membership",
                icon: "IdCard",
                parentId: "ws-community",
            },
            {
                id: "ws-comm-fundraising",
                name: "Fundraising",
                slug: "fundraising",
                icon: "Heart",
                parentId: "ws-community",
            },
        ],
    },
    menuItems: [
        { id: "m-comm-members", label: "Member Directory", slug: "contacts", icon: "Contact" },
        { id: "m-comm-events", label: "Events Calendar", slug: "calendar", icon: "CalendarCheck" },
        { id: "m-comm-chat", label: "General Chat", slug: "communications", icon: "MessageSquare" },
        { id: "m-comm-sponsors", label: "Sponsors CRM", slug: "crm", icon: "Handshake" },
        { id: "m-comm-rules", label: "Club Rules", slug: "knowledge", icon: "Book" },
        { id: "m-comm-announcements", label: "Announcements", slug: "overview", icon: "Bell" },
    ],
    enabledFeatures: [
        "contacts",
        "calendar",
        "communications",
        "crm",
        "knowledge",
        "overview",
        "forms",
    ],
};
