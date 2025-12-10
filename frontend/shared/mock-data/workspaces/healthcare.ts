/**
 * Healthcare Workspace Configuration
 * Clinics, Hospitals, Pharmacies
 */

import type { WorkspaceConfig } from "../types";

export const healthcareConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-healthcare",
        name: "City General Hospital",
        slug: "healthcare",
        description: "Patient care and hospital management",
        icon: "Stethoscope",
        color: "#0ea5e9",
        children: [
            {
                id: "ws-health-pharmacy",
                name: "Pharmacy",
                slug: "pharmacy",
                icon: "Pill",
                parentId: "ws-healthcare",
            },
            {
                id: "ws-health-records",
                name: "Patient Records",
                slug: "records",
                icon: "FileStack",
                parentId: "ws-healthcare",
            },
            {
                id: "ws-health-lab",
                name: "Laboratory",
                slug: "lab",
                icon: "TestTube",
                parentId: "ws-healthcare",
            },
            {
                id: "ws-health-admin",
                name: "Admin & Finance",
                slug: "admin",
                icon: "Building",
                parentId: "ws-healthcare",
            },
        ],
    },
    menuItems: [
        { id: "m-health-patients", label: "Patient CRM", slug: "crm", icon: "Users" },
        { id: "m-health-appointments", label: "Appointments", slug: "calendar", icon: "Calendar" },
        { id: "m-health-inventory", label: "Medical Inventory", slug: "inventory", icon: "Package" },
        { id: "m-health-accounting", label: "Billing & Finance", slug: "accounting", icon: "DollarSign" },
        { id: "m-health-helpdesk", label: "Patient Support", slug: "support", icon: "Headphones" },
        { id: "m-health-tasks", label: "Duty Roster", slug: "tasks", icon: "ClipboardCheck" },
    ],
    enabledFeatures: [
        "crm",
        "calendar",
        "inventory",
        "accounting",
        "support",
        "tasks",
        "notifications",
    ],
};
