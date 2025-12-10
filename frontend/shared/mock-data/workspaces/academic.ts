/**
 * Academic Institution Workspace Configuration
 * Schools, Universities, Educational Institues
 */

import type { WorkspaceConfig } from "../types";

export const academicConfig: WorkspaceConfig = {
    workspace: {
        id: "ws-academic",
        name: "Grand University",
        slug: "academic",
        description: "Main university administration and faculties",
        icon: "GraduationCap",
        color: "#7c3aed",
        children: [
            {
                id: "ws-acad-faculty",
                name: "Faculty of Science",
                slug: "science-faculty",
                icon: "Microscope",
                parentId: "ws-academic",
            },
            {
                id: "ws-acad-student-services",
                name: "Student Services",
                slug: "student-services",
                icon: "Users",
                parentId: "ws-academic",
            },
            {
                id: "ws-acad-research",
                name: "Research Groups",
                slug: "research",
                icon: "FlaskConical",
                parentId: "ws-academic",
            },
            {
                id: "ws-acad-clubs",
                name: "Extracurricular Clubs",
                slug: "clubs",
                icon: "Tent",
                parentId: "ws-academic",
            },
        ],
    },
    menuItems: [
        { id: "m-acad-dashboard", label: "Dashboard", slug: "overview", icon: "LayoutDashboard" },
        { id: "m-acad-directory", label: "Directory", slug: "contacts", icon: "Contact" },
        { id: "m-acad-knowledge", label: "Knowledge Base", slug: "knowledge", icon: "Library" },
        { id: "m-acad-admissions", label: "Admissions", slug: "forms", icon: "ClipboardList" },
        { id: "m-acad-calendar", label: "Class Schedule", slug: "calendar", icon: "Calendar" },
        { id: "m-acad-analytics", label: "Performance Analytics", slug: "analytics", icon: "BarChart3" },
    ],
    enabledFeatures: [
        "overview",
        "contacts",
        "knowledge",
        "forms",
        "calendar",
        "analytics",
        "documents",
    ],
};
