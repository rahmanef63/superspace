"use client";

import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  FileText, 
  Briefcase, 
  Settings, 
  Home, 
  Layers, 
  Link2, 
  Menu, 
  Wrench, 
  Bot, 
  BarChart3, 
  Sliders, 
  Users,
  Globe
} from "lucide-react";
import { SecondarySidebarLayout } from "@/frontend/shared/ui/layout/sidebar/secondary";
import { AdminUserInitializer } from "../shared/components/AdminUserInitializer";

// Lazy load admin components to avoid importing contexts with backend dependencies
import dynamic from "next/dynamic";

const AdminDashboard = dynamic(() => import("../features/admin/pages/AdminDashboard"), { ssr: false });
const AdminProducts = dynamic(() => import("../features/admin/pages/AdminProducts"), { ssr: false });
const AdminPosts = dynamic(() => import("../features/admin/pages/AdminPosts"), { ssr: false });
const AdminPortfolio = dynamic(() => import("../features/admin/pages/AdminPortfolio"), { ssr: false });
const AdminSettings = dynamic(() => import("../features/admin/pages/AdminSettings"), { ssr: false });
const AdminLanding = dynamic(() => import("../features/admin/pages/AdminLanding"), { ssr: false });
const AdminFeatures = dynamic(() => import("../features/admin/pages/AdminFeatures"), { ssr: false });
const AdminQuicklinks = dynamic(() => import("../features/admin/pages/AdminQuicklinks"), { ssr: false });
const AdminNavigation = dynamic(() => import("../features/admin/pages/AdminNavigation"), { ssr: false });
const AdminServices = dynamic(() => import("../features/admin/pages/AdminServices"), { ssr: false });
const AdminAI = dynamic(() => import("../features/admin/pages/AdminAI"), { ssr: false });
const AdminAIAnalytics = dynamic(() => import("../features/admin/pages/AdminAI"), { ssr: false });
const AdminAISettings = dynamic(() => import("../features/admin/pages/AdminAI"), { ssr: false });
const AdminUsers = dynamic(() => import("../features/admin/pages/AdminUsers"), { ssr: false });
const AdminWebsiteSettings = dynamic(() => import("../features/admin/pages/AdminWebsiteSettings"), { ssr: false });

/**
 * CMS Lite Admin Page - For Dashboard Dynamic Route
 * 
 * This component provides the CMS Lite admin interface within the dashboard.
 * It's an optional feature for Superspace users who want to build websites.
 * 
 * Access: /dashboard/cms-admin (or similar dynamic route)
 * 
 * Features:
 * - Content management (products, blog, portfolio)
 * - Site settings and customization
 * - AI chatbot configuration
 * - User management
 * 
 * Note: This uses dynamic imports to avoid loading heavy dependencies
 * for users who don't use the CMS Lite feature.
 */
export default function CmsLitePage() {
  const [activeView, setActiveView] = useState("dashboard");

  // Define sidebar navigation items
  const sidebarSections = [
    {
      id: "main",
      title: "Main",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          active: activeView === "dashboard",
          onClick: () => setActiveView("dashboard"),
        },
        {
          id: "users",
          label: "Users",
          icon: Users,
          active: activeView === "users",
          onClick: () => setActiveView("users"),
        },
      ],
    },
    {
      id: "content",
      title: "Content",
      items: [
        {
          id: "products",
          label: "Products",
          icon: ShoppingCart,
          active: activeView === "products",
          onClick: () => setActiveView("products"),
        },
        {
          id: "posts",
          label: "Blog Posts",
          icon: FileText,
          active: activeView === "posts",
          onClick: () => setActiveView("posts"),
        },
        {
          id: "portfolio",
          label: "Portfolio",
          icon: Briefcase,
          active: activeView === "portfolio",
          onClick: () => setActiveView("portfolio"),
        },
        {
          id: "services",
          label: "Services",
          icon: Wrench,
          active: activeView === "services",
          onClick: () => setActiveView("services"),
        },
      ],
    },
    {
      id: "site",
      title: "Site",
      items: [
        {
          id: "landing",
          label: "Landing",
          icon: Home,
          active: activeView === "landing",
          onClick: () => setActiveView("landing"),
        },
        {
          id: "navigation",
          label: "Navigation",
          icon: Menu,
          active: activeView === "navigation",
          onClick: () => setActiveView("navigation"),
        },
        {
          id: "features",
          label: "Features",
          icon: Layers,
          active: activeView === "features",
          onClick: () => setActiveView("features"),
        },
        {
          id: "quicklinks",
          label: "Quick Links",
          icon: Link2,
          active: activeView === "quicklinks",
          onClick: () => setActiveView("quicklinks"),
        },
      ],
    },
    {
      id: "ai",
      title: "AI",
      items: [
        {
          id: "ai",
          label: "AI Chatbot",
          icon: Bot,
          active: activeView === "ai",
          onClick: () => setActiveView("ai"),
        },
        {
          id: "ai-analytics",
          label: "AI Analytics",
          icon: BarChart3,
          active: activeView === "ai-analytics",
          onClick: () => setActiveView("ai-analytics"),
        },
        {
          id: "ai-settings",
          label: "AI Settings",
          icon: Sliders,
          active: activeView === "ai-settings",
          onClick: () => setActiveView("ai-settings"),
        },
      ],
    },
    {
      id: "config",
      title: "Configuration",
      items: [
        {
          id: "website-settings",
          label: "Website Settings",
          icon: Globe,
          active: activeView === "website-settings",
          onClick: () => setActiveView("website-settings"),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          active: activeView === "settings",
          onClick: () => setActiveView("settings"),
        },
      ],
    },
  ];

  // Render the active view
  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return <AdminDashboard />;
      case "products":
        return <AdminProducts />;
      case "posts":
        return <AdminPosts />;
      case "portfolio":
        return <AdminPortfolio />;
      case "services":
        return <AdminServices />;
      case "landing":
        return <AdminLanding />;
      case "navigation":
        return <AdminNavigation />;
      case "features":
        return <AdminFeatures />;
      case "quicklinks":
        return <AdminQuicklinks />;
      case "users":
        return <AdminUsers />;
      case "ai":
        return <AdminAI />;
      case "ai-analytics":
        return <AdminAIAnalytics />;
      case "ai-settings":
        return <AdminAISettings />;
      case "website-settings":
        return <AdminWebsiteSettings />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <>
      <AdminUserInitializer />
      <SecondarySidebarLayout
        headerProps={{
          title: "CMS Lite Admin",
          description: "Manage your website content, settings, and features",
        }}
        sidebarProps={{
          sections: sidebarSections,
          variant: "panel",
        }}
      >
        <div className="h-full overflow-y-auto p-6">
          {renderActiveView()}
        </div>
      </SecondarySidebarLayout>
    </>
  );
}