/**
 * Mock Data for Guest Dashboard
 * Provides structured workspace configs with unique menus per workspace
 */

export * from "./types";
export * from "./workspaces";

import type { WorkspaceConfig, MockWorkspace, MockMenuItem, MockSystemFeature } from "./types";
import {
    corporateConfig,
    creativeAgencyConfig,
    academicConfig,
    healthcareConfig,
    ngoConfig,
    governmentConfig,
    retailConfig,
    constructionConfig,
    personalConfig,
    communityConfig,
} from "./workspaces";

/**
 * All workspace configurations
 */
export const ALL_WORKSPACE_CONFIGS: WorkspaceConfig[] = [
    corporateConfig,
    creativeAgencyConfig,
    academicConfig,
    healthcareConfig,
    ngoConfig,
    governmentConfig,
    retailConfig,
    constructionConfig,
    personalConfig,
    communityConfig,
];

/**
 * Get workspace config by ID
 */
export function getWorkspaceConfig(workspaceId: string): WorkspaceConfig | undefined {
    // Check top-level workspaces
    const topLevel = ALL_WORKSPACE_CONFIGS.find((c) => c.workspace.id === workspaceId);
    if (topLevel) return topLevel;

    // Check nested workspaces - return parent config for now
    for (const config of ALL_WORKSPACE_CONFIGS) {
        const child = config.workspace.children?.find((c) => c.id === workspaceId);
        if (child) return config;
    }

    return undefined;
}

/**
 * Get menu items for a workspace
 */
export function getMenuForWorkspace(workspaceId: string): MockMenuItem[] {
    const config = getWorkspaceConfig(workspaceId);
    return config?.menuItems ?? [];
}

/**
 * Get all workspaces as flat list (for workspace switcher)
 */
export function getAllWorkspacesFlat(): MockWorkspace[] {
    const result: MockWorkspace[] = [];

    for (const config of ALL_WORKSPACE_CONFIGS) {
        result.push(config.workspace);
        if (config.workspace.children) {
            result.push(...config.workspace.children);
        }
    }

    return result;
}

/**
 * Get child workspaces of a parent
 */
export function getChildWorkspaces(parentId: string): MockWorkspace[] {
    const config = ALL_WORKSPACE_CONFIGS.find((c) => c.workspace.id === parentId);
    return config?.workspace.children ?? [];
}

/**
 * Mock system features for feature store
 */
export const MOCK_SYSTEM_FEATURES: MockSystemFeature[] = [
    { featureId: "overview", name: "Overview", description: "Dashboard overview", icon: "LayoutDashboard", category: "core", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "tasks", name: "Tasks", description: "Task management", icon: "CheckSquare", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "calendar", name: "Calendar", description: "Event scheduling", icon: "Calendar", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "documents", name: "Documents", description: "Document management", icon: "FileText", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "projects", name: "Projects", description: "Project tracking", icon: "FolderKanban", category: "productivity", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "crm", name: "CRM", description: "Customer management", icon: "Users", category: "business", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "analytics", name: "Analytics", description: "Data insights", icon: "BarChart3", category: "insights", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "ai", name: "AI Assistant", description: "AI-powered help", icon: "Sparkles", category: "ai", isInstalled: true, isPremium: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "inventory", name: "Inventory", description: "Stock management", icon: "Package", category: "operations", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "sales", name: "Sales", description: "Sales tracking", icon: "Receipt", category: "business", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "communications", name: "Communications", description: "Messaging", icon: "MessageCircle", category: "communication", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "automation", name: "Automation", description: "Workflow automation", icon: "Workflow", category: "operations", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "support", name: "Support", description: "Customer support", icon: "HeadphonesIcon", category: "business", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "reports", name: "Reports", description: "Report generation", icon: "FileBarChart", category: "insights", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "contact", name: "Contacts", description: "Contact management", icon: "Contact", category: "communication", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
    { featureId: "knowledge", name: "Knowledge Base", description: "Documentation", icon: "BookOpen", category: "content", isInstalled: true, isEnabled: true, isPublic: true, isReady: true, status: "stable" },
];
