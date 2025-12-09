# 🚀 Superspace Features Plan

> **Superspace = Unified App Builder**
> 
> Dokumen ini berisi arsitektur **Dynamic Menu System** yang reusable untuk semua System Management Tools.
> 
> **Filosofi:** Lebih baik membuat **features yang super** daripada banyak features kecil yang fungsinya mirip-mirip.

---

## 🎯 Core Concept: Dynamic Menu System

### Kenapa Dynamic Menu?

1. **Reusable** → 1 menu bisa dipakai 10+ sistem
2. **Schema lebih clean** → tidak perlu buat menu berulang di setiap feature
3. **RBAC lebih simpel** → cukup map role → menu
4. **Bundling lebih efisien** → workspace template jadi ringan
5. **AI dapat compose menu secara otomatis** berdasarkan fitur yang diaktifkan

### Statistik

| Metric | Value |
|--------|-------|
| Total menu dari semua System Management | **158 menu** |
| Menu yang bisa di-reuse (universal) | **19 menu** |
| Efisiensi | **88% reduction** |

---

## 🔥 Universal Dynamic Menus (19 Core Menus)

Berikut daftar menu **inti yang universal**, cocok dijadikan *foundational menu templates*.

| # | Dynamic Menu | Dipakai di System Management | Priority |
|---|--------------|------------------------------|----------|
| 1 | **Overview** | Semua | P0 |
| 2 | **Reports** | Semua | P0 |
| 3 | **Settings** | Semua | P0 |
| 4 | **Search** | Semua | P0 |
| 5 | **Notifications** | CRM, HRIS, Projects, Inventory, POS, Helpdesk | P0 |
| 6 | **Users / Accounts** | CRM, HRIS, CMS, Helpdesk | P0 |
| 7 | **Activities / Tasks** | CRM, HRIS, Projects, Marketing, Helpdesk | P0 |
| 8 | **Files / Documents** | Projects, HRIS, CMS, Helpdesk, Knowledge Base | P0 |
| 9 | **Analytics / Insights** | CRM, POS, Marketing, Finance, BI | P1 |
| 10 | **Calendar** | HRIS, Projects, CRM, Marketing | P1 |
| 11 | **Automations** | CRM, HRIS, Marketing, Helpdesk, Projects | P1 |
| 12 | **Contacts / People** | CRM, HRIS, Marketing, Helpdesk | P0 |
| 13 | **Forms** | CMS, CRM, HRIS, Helpdesk | P1 |
| 14 | **Approvals** | ERP, HRIS, Finance, Procurement | P1 |
| 15 | **Tags / Categories** | CMS, CRM, Inventory, Projects | P1 |
| 16 | **Audit Log** | ERP, CRM, Finance, HRIS | P0 |
| 17 | **Import / Export** | CRM, HRIS, Inventory, Accounting | P1 |
| 18 | **Integrations** | CRM, Marketing, CMS, Accounting, Helpdesk | P2 |
| 19 | **Comments / Discussions** | Projects, Docs, CRM, Helpdesk | P1 |

---

## 📊 Dynamic Menu Details

### 🟩 A. Overview
- **Dipakai oleh:** CRM, ERP, HRIS, Projects, POS, Finance, CMS, Marketing, Helpdesk, Knowledge Base, BI
- **Kenapa universal:** Semua sistem butuh starting page untuk ringkasan data
- **Components:** Metrics cards, Charts, Recent activity, Quick actions
- **Status:** ✅ Implemented

### 🟩 B. Reports
- **Dipakai oleh:** CRM, ERP, HRIS, Finance, Projects, Inventory, POS, Marketing, Helpdesk, BI
- **Kenapa universal:** Semua tools punya laporan
- **Components:** Report builder, Filters, Export, Scheduling
- **Status:** ✅ Implemented

### 🟩 C. Settings
- **Dipakai oleh:** Semua sistem
- **Kenapa universal:** Role, permissions, views, automations, integrations
- **Components:** General, Workspace, Users, Permissions, Billing, Integrations
- **Status:** ✅ Implemented

### 🟩 D. Search (Global & Local)
- **Dipakai oleh:** Semua sistem
- **Kenapa universal:** Menu wajib untuk navigasi cepat
- **Components:** Global search, Filters, Recent searches, Saved searches
- **Status:** ✅ Implemented

### 🟩 E. Notifications
- **Dipakai oleh:** CRM, HRIS, Projects, Inventory, POS, Helpdesk
- **Kenapa universal:** Semua butuh notifikasi tugas/event
- **Components:** In-app notifications, Email, Push, Preferences
- **Status:** ✅ Implemented

### 🟩 F. Users / Accounts
- **Dipakai oleh:** CRM, HRIS, CMS, Helpdesk
- **Kenapa universal:** User management universal
- **Components:** User list, Roles, Invitations, Activity log
- **Status:** ✅ Implemented

### 🟩 G. Activities / Tasks
- **Dipakai oleh:** CRM, HRIS, Projects, Marketing, Helpdesk
- **Kenapa universal:** Semua modul punya to-do atau aktivitas
- **Components:** Task list, Kanban, Calendar view, Reminders
- **Status:** ✅ Implemented

### 🟩 H. Files / Documents
- **Dipakai oleh:** Projects, HRIS, CMS, Helpdesk, Knowledge Base
- **Kenapa universal:** Semua feature butuh upload & attach dokumen
- **Components:** File browser, Upload, Sharing, Version history
- **Status:** ✅ Implemented

### 🟩 I. Analytics / Insights
- **Dipakai oleh:** POS, CRM, Marketing, Inventory, Finance, BI
- **Kenapa universal:** Semua data-driven modules butuh insight
- **Components:** Charts, Metrics, Trends, Comparisons
- **Status:** ✅ Implemented

### 🟩 J. Calendar
- **Dipakai oleh:** HRIS, Projects, CRM, Marketing
- **Kenapa universal:** Event, scheduling, reminders
- **Components:** Day/Week/Month view, Events, Scheduling, Sync
- **Status:** ✅ Implemented

### 🟩 K. Automations
- **Dipakai oleh:** CRM, HRIS, Marketing, Projects, Helpdesk
- **Kenapa universal:** Trigger–action–condition universal
- **Components:** Workflow builder, Triggers, Actions, Conditions
- **Status:** ✅ Implemented

### 🟩 L. Contacts / People
- **Dipakai oleh:** CRM, HRIS, Marketing, Helpdesk
- **Kenapa universal:** Entity utama adalah orang
- **Components:** Contact list, Details, History, Tags
- **Status:** ✅ Implemented

### 🟩 M. Forms
- **Dipakai oleh:** CMS, CRM, HRIS, Helpdesk
- **Kenapa universal:** Semua butuh input data custom
- **Components:** Form builder, Fields, Validation, Submissions
- **Status:** ✅ Implemented

### 🟩 N. Approvals
- **Dipakai oleh:** ERP, HRIS, Finance, Procurement
- **Kenapa universal:** Flow persetujuan universal
- **Components:** Approval queue, Workflow, History, Delegation
- **Status:** ✅ Implemented

### 🟩 O. Tags / Categories
- **Dipakai oleh:** CMS, CRM, Projects, Inventory
- **Kenapa universal:** Data grouping universal
- **Components:** Tag manager, Categories, Filters, Bulk tagging
- **Status:** ✅ Implemented

### 🟩 P. Audit Log
- **Dipakai oleh:** ERP, HRIS, Finance, CRM
- **Kenapa universal:** Log aksi sangat penting secara compliance
- **Components:** Activity log, Filters, Export, Retention
- **Status:** ✅ Implemented

### 🟩 Q. Import / Export
- **Dipakai oleh:** Inventory, CRM, Accounting, Projects, HRIS
- **Kenapa universal:** Semua modul butuh migrasi data
- **Components:** CSV/Excel import, Export, Mapping, History
- **Status:** ✅ Implemented

### 🟩 R. Integrations
- **Dipakai oleh:** CRM, Marketing, CMS, Accounting, Helpdesk
- **Kenapa universal:** Hubungkan ke API atau service lain
- **Components:** Integration list, OAuth, Webhooks, API keys
- **Status:** ✅ Implemented

### 🟩 S. Comments / Discussions
- **Dipakai oleh:** Projects, Docs, CRM, Helpdesk
- **Kenapa universal:** Kolaborasi dan diskusi
- **Components:** Thread, Mentions, Reactions, Attachments
- **Status:** ✅ Implemented

---

## 📊 Implementation Status Overview

| Status | Count | Percentage |
|--------|-------|-----------|
| ✅ Implemented | 19 | 100% |
| 🟡 Partial | 0 | 0% |
| 🔴 Not Started | 0 | 0% |

---

## 🗺️ Dynamic Menu → System Mapping

Bagaimana 19 Dynamic Menu digunakan di setiap System Management:

### Matrix View

| Dynamic Menu | CRM | ERP | HRIS | Projects | Inventory | POS | Finance | CMS | Marketing | Helpdesk | Knowledge | BI |
|--------------|-----|-----|------|----------|-----------|-----|---------|-----|-----------|----------|-----------|-----|
| Overview | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | - | ✅ | ✅ | - | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | - | - | - | ✅ | - | - |
| Users/Accounts | ✅ | - | ✅ | - | - | - | - | ✅ | - | ✅ | - | - |
| Activities/Tasks | ✅ | - | ✅ | ✅ | - | - | - | - | ✅ | ✅ | - | - |
| Files/Documents | - | - | ✅ | ✅ | - | - | - | ✅ | - | ✅ | ✅ | - |
| Analytics | ✅ | ✅ | - | - | ✅ | ✅ | ✅ | - | ✅ | - | - | ✅ |
| Calendar | ✅ | - | ✅ | ✅ | - | - | - | - | ✅ | - | - | - |
| Automations | ✅ | - | ✅ | ✅ | - | - | - | - | ✅ | ✅ | - | - |
| Contacts/People | ✅ | - | ✅ | - | - | - | - | - | ✅ | ✅ | - | - |
| Forms | ✅ | - | ✅ | - | - | - | - | ✅ | - | ✅ | - | - |
| Approvals | - | ✅ | ✅ | - | - | - | ✅ | - | - | - | - | - |
| Tags/Categories | ✅ | - | - | ✅ | ✅ | - | - | ✅ | - | - | - | - |
| Audit Log | ✅ | ✅ | ✅ | - | - | - | ✅ | - | - | - | - | - |
| Import/Export | ✅ | - | ✅ | ✅ | ✅ | - | ✅ | - | - | - | - | - |
| Integrations | ✅ | - | - | - | - | - | ✅ | ✅ | ✅ | ✅ | - | - |
| Comments | ✅ | - | - | ✅ | - | - | - | - | - | ✅ | ✅ | - |

---

## 🏗️ System Management Overview (Consolidated)

Daripada detail per-sistem, berikut ringkasan sistem yang tersedia:

| # | System | Focus | Dynamic Menus Used | Schema Status |
|---|--------|-------|-------------------|---------------|
| 1 | **CRM** | Sales, Customers | 15 menus | ✅ Ready |
| 2 | **ERP** | Operations | 8 menus | ✅ Ready |
| 3 | **HRIS** | Employees, Payroll | 13 menus | ✅ Ready |
| 4 | **Projects** | Tasks, Progress | 11 menus | ✅ Ready |
| 5 | **Inventory** | Stock, Warehouse | 8 menus | ✅ Ready |
| 6 | **POS** | Cashier, Retail | 6 menus | 🔴 TODO |
| 7 | **Finance** | Accounting | 10 menus | ✅ Ready |
| 8 | **CMS** | Website, Content | 8 menus | ✅ Ready |
| 9 | **Marketing** | Automation, Campaigns | 9 menus | 🔴 TODO |
| 10 | **Helpdesk** | Support, Tickets | 12 menus | ✅ Ready |
| 11 | **Knowledge** | Documentation | 5 menus | ✅ Ready |
| 12 | **BI** | Analytics, Reports | 6 menus | 🔴 TODO |

### System-Specific Menus (Non-Universal)

Beberapa menu yang **spesifik** untuk sistem tertentu (tidak universal):

| System | Specific Menus |
|--------|---------------|
| **CRM** | Leads, Opportunities, Pipeline, Quotations |
| **HRIS** | Payroll, Leave, Attendance, Performance |
| **Inventory** | Warehouses, Stock Transfer, SKU, Stock Opname |
| **POS** | POS Terminal, Cash Close, Receipts |
| **Finance** | General Ledger, COA, AR/AP, Tax |
| **CMS** | Pages, Posts, Media, Menus, Themes |
| **Marketing** | Campaigns, Funnels, Email Templates |
| **Helpdesk** | Tickets, SLA, Live Chat |

---

## 🔥 Workspace Templates (Superspace-ready)

Bundle workspace siap pakai untuk berbagai industri:

### Business Templates

| Template | Dynamic Menus | System-Specific | Status |
|----------|--------------|-----------------|--------|
| **Startup** | Overview, Tasks, Contacts, Files, Chat | CRM Pipeline, Projects Kanban | 🟡 |
| **Business Pro** | + Reports, Approvals, Analytics | + Finance, HR basics | 🔴 |
| **Enterprise** | All 19 menus | All systems | 🔴 |

### Industry Templates

| Template | Core Menus | Specific Features | Status |
|----------|-----------|-------------------|--------|
| **Accounting Firm** | Overview, Reports, Files, Contacts | Finance (GL, AR/AP) | 🔴 |
| **CEO Overview** | Overview, Analytics, Reports, Notifications | BI Charts | 🔴 |
| **Operations** | Overview, Tasks, Inventory, Approvals | Stock, Workflow | 🔴 |
| **Property Mgmt** | Overview, Contacts, Files, Calendar | Assets, CRM | 🔴 |
| **Hospitality** | Overview, Analytics, Inventory | POS, CRM | 🔴 |
| **Clinic** | Overview, Calendar, Contacts, Files | CRM, Scheduling | 🔴 |
| **Construction** | Overview, Tasks, Files, Approvals | Projects, Inventory | 🔴 |
| **Freelance** | Overview, Tasks, Contacts, Files | CRM, Projects | 🔴 |
| **Student** | Overview, Tasks, Calendar, Files | Docs, Knowledge | 🔴 |
| **Family** | Overview, Tasks, Calendar | Budget, Shared | 🔴 |
| **Second Brain** | Overview, Files, Tags, Search | Docs, Knowledge | 🔴 |

---

## 📁 Project Structure

```
convex/
├── features/
│   ├── core/          # Core shared functionality
│   ├── crm/           # CRM module
│   ├── sales/         # Sales module (ERP)
│   ├── inventory/     # Inventory module (ERP)
│   ├── hr/            # HR module (ERP)
│   ├── accounting/    # Accounting module (ERP)
│   ├── projects/      # Project management
│   ├── support/       # Helpdesk
│   ├── docs/          # Document management
│   ├── knowledge/     # Knowledge base
│   ├── chat/          # Communication
│   ├── workflows/     # Workflow automation
│   ├── cms/           # CMS
│   ├── cms_lite/      # CMS Lite modules
│   └── ...
├── shared/
│   ├── comments/      # Shared comments (Dynamic Menu)
│   ├── attachments/   # Shared files (Dynamic Menu)
│   ├── automation/    # Shared automation (Dynamic Menu)
│   ├── bulk/          # Bulk operations (Import/Export)
│   ├── customFields/  # Custom fields
│   ├── search/        # Global search (Dynamic Menu)
│   ├── audit/         # Audit log (Dynamic Menu)
│   ├── notifications/ # Notifications (Dynamic Menu)
│   └── ...
└── templates/
    └── bundles/       # Bundle definitions

frontend/
├── features/
│   ├── overview/      # Universal Overview
│   ├── reports/       # Universal Reports
│   ├── settings/      # Universal Settings
│   ├── search/        # Universal Search
│   ├── notifications/ # Universal Notifications
│   ├── activities/    # Universal Tasks/Activities
│   ├── calendar/      # Universal Calendar
│   ├── files/         # Universal Files/Documents
│   ├── comments/      # Universal Comments
│   ├── forms/         # Universal Forms
│   ├── crm/       # CRM-specific
│   ├── sales/     # Sales-specific
│   ├── inventory/ # Inventory-specific
│   ├── hr/        # HR-specific
│   ├── accounting/# Accounting-specific
│   └── ...
└── shared/
    └── components/    # Shared UI components
```

---

## 🎯 Implementation Priority

### Phase 1 - Universal Menus (Q1)
> Fokus: Build the 19 Dynamic Menus first

1. ✅ Overview
2. ✅ Settings
3. ✅ Search
4. ✅ Notifications
5. ✅ Audit Log
6. ✅ Comments
7. 🟡 Reports (basic)
8. 🟡 Activities/Tasks
9. 🟡 Files/Documents
10. ✅ Calendar
11. ✅ Analytics
12. 🟡 Automations
13. ✅ Forms
14. ✅ Approvals
15. ✅ Import/Export
16. ✅ Integrations
17. ✅ Contacts/People
18. ✅ Tags/Categories

### Phase 2 - Core Systems (Q2)
> Fokus: CMS, CRM, Projects (most requested)

1. ✅ CMS (Done)
2. 🟡 CRM basics
3. 🟡 Projects basics
4. 🟡 Helpdesk basics

### Phase 3 - Business Systems (Q3)
> Fokus: Finance, HR, Inventory

1. 🔴 Finance/Accounting
2. 🔴 HRIS basics
3. 🔴 Inventory
4. 🔴 BI/Analytics

### Phase 4 - Advanced & Industry (Q4)
> Fokus: POS, Marketing, Templates

1. 🔴 POS
2. 🔴 Marketing Automation
3. 🔴 Industry Templates
4. 🔴 AI Menu Composer

---

## 📝 Architecture Notes

### Dynamic Menu JSON Structure

```json
{
  "menuId": "overview",
  "type": "universal",
  "label": "Overview",
  "icon": "LayoutDashboard",
  "route": "/overview",
  "permissions": ["view:overview"],
  "availableIn": ["crm", "erp", "hris", "projects", "..."],
  "config": {
    "widgets": ["metrics", "charts", "activity", "quickActions"],
    "customizable": true
  }
}
```

### System → Menu Registration

```typescript
// Example: CRM system configuration
export const crmConfig = {
  id: "crm",
  name: "CRM",
  menus: {
    universal: ["overview", "reports", "settings", "search", "notifications", 
                "contacts", "activities", "analytics", "calendar", "automations",
                "forms", "tags", "auditLog", "import", "integrations", "comments"],
    specific: ["leads", "opportunities", "pipeline", "quotations", "campaigns"]
  },
  defaultMenus: ["overview", "leads", "contacts", "pipeline", "activities"]
};
```

### AI Menu Composer (Future)

AI dapat otomatis compose menu berdasarkan:
1. Industry template yang dipilih
2. Features yang diaktifkan
3. User role
4. Usage patterns

---

*Last Updated: December 9, 2025*
