// Optional Features Catalog
//
// Available features that can be installed from the Menu Store.
//
// AUTO-GENERATED - DO NOT EDIT MANUALLY.
// Source: frontend/features/<feature>/config.ts (auto-discovered)
// Update via: pnpm run sync:features
export const OPTIONAL_FEATURES_CATALOG = [
  {
    "slug": "calls",
    "name": "Calls",
    "description": "Voice and video calls with team members",
    "icon": "Phone",
    "version": "2.0.0",
    "category": "communication",
    "tags": [
      "communication",
      "calls",
      "voice",
      "video"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "status",
    "name": "Status",
    "description": "Share status updates with your team",
    "icon": "Camera",
    "version": "2.0.0",
    "category": "communication",
    "tags": [
      "communication",
      "status",
      "updates",
      "stories"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "reports",
    "name": "Reports",
    "description": "Analytics and reporting dashboard",
    "icon": "BarChart",
    "version": "1.0.0",
    "category": "analytics",
    "tags": [
      "reports",
      "analytics",
      "dashboard"
    ],
    "requiresPermission": "VIEW_REPORTS",
    "originalRequiresPermission": "VIEW_REPORTS",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "tasks",
    "name": "Tasks",
    "description": "Task management and tracking",
    "icon": "CheckSquare",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "productivity",
      "project-management"
    ],
    "status": "beta",
    "isReady": true,
    "expectedRelease": "Q1 2025",
    "featureType": "optional"
  },
  {
    "slug": "support",
    "name": "Support",
    "description": "Customer support and helpdesk ticketing system",
    "icon": "Headphones",
    "version": "1.0.0",
    "category": "communication",
    "tags": [
      "support",
      "tickets",
      "helpdesk"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "projects",
    "name": "Projects",
    "description": "Project management with team discussions",
    "icon": "FolderKanban",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "projects",
      "collaboration",
      "discussions"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "notifications",
    "name": "Notifications",
    "description": "System notifications and activity feed",
    "icon": "Bell",
    "version": "1.0.0",
    "category": "communication",
    "tags": [
      "notifications",
      "activity",
      "feed"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "builder",
    "name": "Builder",
    "description": "Build apps, content, and interfaces with visual builder tools",
    "icon": "Hammer",
    "version": "1.0.0",
    "category": "creativity",
    "tags": [
      "cms",
      "content",
      "builder",
      "visual"
    ],
    "requiresPermission": "schemas.create",
    "originalRequiresPermission": "schemas.create",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "analytics",
    "name": "Analytics",
    "description": "Monitor your business performance with real-time analytics",
    "icon": "BarChart3",
    "version": "1.0.0",
    "category": "analytics",
    "tags": [
      "analytics",
      "insights",
      "metrics",
      "dashboard"
    ],
    "requiresPermission": "analytics.view",
    "originalRequiresPermission": "analytics.view",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "automation",
    "name": "Automation",
    "description": "Automate workflows and processes with visual builders",
    "icon": "Workflow",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "automation",
      "workflows",
      "visual-builder",
      "no-code"
    ],
    "requiresPermission": "automation.create",
    "originalRequiresPermission": "automation.create",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "hr",
    "name": "HR Management",
    "description": "Human Resources Management",
    "icon": "Users",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "hr",
      "administration"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "accounting",
    "name": "Accounting",
    "description": "Financial Management and Accounting",
    "icon": "Calculator",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "accounting",
      "administration"
    ],
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "sales",
    "name": "Sales & Invoicing",
    "description": "Complete sales management solution with quotes, invoices, recurring billing, payment processing, and sales analytics",
    "icon": "ShoppingCart",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "erp",
      "sales",
      "invoicing",
      "payments"
    ],
    "requiresPermission": "erp.sales.view",
    "originalRequiresPermission": "erp.sales.view",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "inventory",
    "name": "Inventory Management",
    "description": "Comprehensive inventory management with multi-warehouse support, stock tracking, and demand forecasting",
    "icon": "Package",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "erp",
      "inventory",
      "warehouse",
      "stock"
    ],
    "requiresPermission": "erp.inventory.view",
    "originalRequiresPermission": "erp.inventory.view",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "crm",
    "name": "CRM",
    "description": "Customer Relationship Management with contacts, leads, opportunities, and sales pipeline",
    "icon": "Users",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "erp",
      "crm",
      "customers",
      "leads",
      "sales"
    ],
    "requiresPermission": "erp.crm.view",
    "originalRequiresPermission": "erp.crm.view",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  }
]
