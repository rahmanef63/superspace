// Optional Features Catalog
//
// Available features that can be installed from the Menu Store.
//
// AUTO-GENERATED - DO NOT EDIT MANUALLY.
// Source: frontend/features/<feature>/config.ts (auto-discovered)
// Update via: pnpm run sync:features
export const OPTIONAL_FEATURES_CATALOG = [
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
    "slug": "calendar",
    "name": "Calendar",
    "description": "Team calendar with event management and scheduling",
    "icon": "Calendar",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "scheduling",
      "events",
      "productivity"
    ],
    "requiresPermission": "calendar.view",
    "originalRequiresPermission": "calendar.view",
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
    "slug": "forms",
    "name": "Forms",
    "description": "Build custom forms for data collection",
    "icon": "FileText",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "forms",
      "data-collection",
      "surveys"
    ],
    "requiresPermission": "forms.view",
    "originalRequiresPermission": "forms.view",
    "status": "beta",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "approvals",
    "name": "Approvals",
    "description": "Approval workflows and request management",
    "icon": "CheckCircle",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "approvals",
      "workflows",
      "requests"
    ],
    "requiresPermission": "approvals.view",
    "originalRequiresPermission": "approvals.view",
    "status": "beta",
    "isReady": true,
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
    "slug": "audit-log",
    "name": "Audit Log",
    "description": "View activity logs and audit trail",
    "icon": "History",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "audit",
      "logs",
      "compliance",
      "security"
    ],
    "requiresPermission": "audit-log.view",
    "originalRequiresPermission": "audit-log.view",
    "status": "stable",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "import-export",
    "name": "Import/Export",
    "description": "Import and export data across workspace",
    "icon": "ArrowUpDown",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "import",
      "export",
      "data",
      "migration"
    ],
    "requiresPermission": "import-export.view",
    "originalRequiresPermission": "import-export.view",
    "status": "beta",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "integrations",
    "name": "Integrations",
    "description": "Connect with third-party services and APIs",
    "icon": "Plug",
    "version": "1.0.0",
    "category": "administration",
    "tags": [
      "integrations",
      "api",
      "webhooks",
      "oauth"
    ],
    "requiresPermission": "integrations.view",
    "originalRequiresPermission": "integrations.view",
    "status": "beta",
    "isReady": true,
    "featureType": "optional"
  },
  {
    "slug": "pos",
    "name": "POS",
    "description": "Point of Sale and retail management",
    "icon": "ShoppingCart",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "pos",
      "retail",
      "sales",
      "cashier"
    ],
    "requiresPermission": "pos.view",
    "originalRequiresPermission": "pos.view",
    "status": "beta",
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
    "slug": "marketing",
    "name": "Marketing",
    "description": "Marketing automation and campaign management",
    "icon": "Megaphone",
    "version": "1.0.0",
    "category": "content",
    "tags": [
      "marketing",
      "campaigns",
      "email",
      "automation"
    ],
    "requiresPermission": "marketing.view",
    "originalRequiresPermission": "marketing.view",
    "status": "beta",
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
    "slug": "bi",
    "name": "Business Intelligence",
    "description": "Advanced analytics and business intelligence",
    "icon": "LineChart",
    "version": "1.0.0",
    "category": "analytics",
    "tags": [
      "bi",
      "analytics",
      "dashboards",
      "reports"
    ],
    "requiresPermission": "bi.view",
    "originalRequiresPermission": "bi.view",
    "status": "beta",
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
    "slug": "sales",
    "name": "Sales",
    "description": "Sales management and pipeline tracking",
    "icon": "DollarSign",
    "version": "1.0.0",
    "category": "productivity",
    "tags": [
      "sales",
      "pipeline",
      "deals",
      "revenue"
    ],
    "requiresPermission": "sales.view",
    "originalRequiresPermission": "sales.view",
    "status": "beta",
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
