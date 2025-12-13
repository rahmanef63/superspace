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
| 6 | **POS** | Cashier, Retail | 6 menus | ✅ Beta |
| 7 | **Finance** | Accounting | 10 menus | ✅ Ready |
| 8 | **CMS** | Website, Content | 8 menus | ✅ Ready |
| 9 | **Marketing** | Automation, Campaigns | 9 menus | ✅ Beta |
| 10 | **Helpdesk** | Support, Tickets | 12 menus | ✅ Ready |
| 11 | **Knowledge** | Documentation | 5 menus | ✅ Ready |
| 12 | **BI** | Analytics, Reports | 6 menus | ✅ Beta |

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

> Catatan penting: daftar folder di bawah menunjukkan struktur repo saat ini.
> Untuk **standar wajib setiap feature**, lihat template per-feature setelah code block.

```
convex/
├── features/
│   ├── menus/           # Dynamic Menu System (menu items, sets, manifests)
│   ├── bundles/         # Workspace bundles
│   ├── industryTemplates/# Industry templates
│   ├── reports/         # Reporting (universal)
│   ├── auditLog/
│   ├── notifications/
│   ├── search/
│   ├── comments/
│   ├── calendar/
│   ├── tasks/
│   ├── forms/
│   ├── approvals/
│   ├── tags/
│   ├── importExport/
│   ├── integrations/
│   ├── userManagement/  # Users / Accounts
│   ├── crm/             # System modules
│   ├── projects/
│   ├── support/
│   ├── inventory/
│   ├── accounting/
│   ├── hr/
│   ├── pos/
│   ├── marketing/
│   ├── cms/
│   ├── cms_lite/
│   ├── knowledge/
│   └── ...
├── shared/              # Shared backend utilities (rbac, audit helpers, etc.)
└── templates/
    └── ...

frontend/
├── features/
│   ├── menu-store/      # Manage menus + install feature menus
│   ├── overview/        # Universal menus/features
│   ├── reports/
│   ├── audit-log/
│   ├── calendar/
│   ├── tasks/
│   ├── documents/       # Files/Documents
│   ├── forms/
│   ├── import-export/
│   ├── integrations/
│   ├── user-management/ # Users / Accounts
│   ├── crm/             # System modules
│   ├── projects/
│   ├── support/
│   ├── inventory/
│   ├── accounting/
│   ├── hr/
│   ├── pos/
│   ├── marketing/
│   ├── cms-lite/
│   ├── knowledge/
│   └── ...
└── shared/
    ├── ui/layout/       # Sidebar, breadcrumbs, menu tree
    ├── settings/        # Dynamic Feature Settings registry
    └── foundation/      # Feature manifest + lazy-loaded registry
```

### Per-feature template (wajib)

Template ini berlaku untuk semua feature slug `X`.

```txt
frontend/features/X/
  agents/        # AI-facing tools + prompts (client-side wrappers)
  settings/      # Feature settings UI
  init.ts        # registerFeatureSettings('X', ...)

convex/features/X/
  agents/        # Server-side tool handlers (permission-gated)
  queries.ts     # Domain queries (optional, recommended)
  mutations.ts   # Domain mutations (optional, recommended)
```

---

## 🎯 Implementation Priority

### Phase 1 - Universal Menus (Q1) ✅
> Fokus: Build the 19 Dynamic Menus first

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Overview | ✅ Stable | Dashboard widgets, quick actions |
| 2 | Settings | ✅ Stable | Workspace, users, permissions |
| 3 | Search | ✅ Stable | Global search, filters |
| 4 | Notifications | ✅ Stable | In-app, email preferences |
| 5 | Users / Accounts | ✅ Stable | Invitations, roles, memberships |
| 6 | Audit Log | ✅ Stable | Activity tracking, compliance |
| 7 | Comments | ✅ Stable | Threaded discussions |
| 8 | Reports | ✅ Stable | Basic charts, export |
| 9 | Activities/Tasks | ✅ Stable | Kanban, list view |
| 10 | Files/Documents | ✅ Stable | Upload, versioning |
| 11 | Calendar | ✅ Stable | Events, scheduling |
| 12 | Analytics | ✅ Stable | Charts, metrics |
| 13 | Automations | ✅ Stable | Visual workflow builder |
| 14 | Forms | ✅ Stable | Form builder, submissions |
| 15 | Approvals | ✅ Beta | Basic workflow |
| 16 | Import/Export | ✅ Beta | CSV, JSON support |
| 17 | Integrations | ✅ Beta | OAuth, webhooks |
| 18 | Contacts/People | ✅ Stable | Contact management |
| 19 | Tags/Categories | ✅ Stable | Tagging system |

### Phase 2 - Core Systems (Q2) ✅
| System | Status | Notes |
|--------|--------|-------|
| CMS | ✅ Stable | Full content management |
| CRM | ✅ Beta | Contacts, leads, pipeline |
| Projects | ✅ Beta | Task boards, discussions |
| Helpdesk (Support) | ✅ Stable | Ticket management |

### Phase 3 - Business Systems (Q3)
| System | Status | Notes |
|--------|--------|-------|
| Accounting | ✅ Stable | Basic ledger, invoices |
| HR Management | ✅ Stable | Employee records |
| Inventory | ✅ Stable | Stock tracking, warehouses |
| BI/Analytics | ✅ Beta | Advanced dashboards |

### Phase 4 - Advanced & Industry (Q4)
| System | Status | Notes |
|--------|--------|-------|
| POS | ✅ Beta | Retail cashier, receipts |
| Marketing | ✅ Beta | Campaign management |
| Sales & Invoicing | ✅ Beta | Pipeline, quotes, invoicing |
| Industry Templates | ✅ Beta | Pre-built workspace bundles |
| AI Menu Composer | ✅ Beta | Intelligent menu suggestions |

---

## 🚀 Feature Improvements (Above Average)

> **Filosofi:** Setiap feature harus punya "WOW factor" yang membedakan dari kompetitor.

### 🟩 A. Overview

**Current Gaps:**
- [ ] No real-time data refresh
- [ ] Widgets tidak customizable per user
- [ ] No drag-and-drop layout

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Live Activity Feed** - Real-time updates with web sockets | High |
| P0 | **Widget Customization** - Users can add/remove/resize widgets | High |
| P1 | **Quick Actions Bar** - Configurable shortcuts untuk actions paling sering | Medium |
| P1 | **AI Summary** - AI-generated daily/weekly summary | High |
| P2 | **Goals Tracking** - Set and track OKRs/KPIs di overview | Medium |

---

### 🟩 B. Reports

**Current Gaps:**
- [ ] No visual report builder (drag-drop)
- [ ] Limited chart types
- [ ] No scheduled report emails
- [ ] No dashboard sharing

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Visual Report Builder** - Drag-drop interface seperti Metabase | Very High |
| P0 | **Chart Library** - 15+ chart types (waterfall, funnel, sankey, etc.) | High |
| P1 | **Scheduled Reports** - Auto-email reports harian/mingguan | High |
| P1 | **Public Dashboard Links** - Share dashboard via link | Medium |
| P2 | **AI Query** - Natural language to SQL/chart | Very High |

---

### 🟩 C. Calendar

**Current Gaps:**
- [ ] No Google/Outlook sync
- [ ] No meeting room booking
- [ ] No recurring events with exceptions
- [ ] No time zone support

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **External Calendar Sync** - Google, Outlook, iCal | Very High |
| P0 | **Recurring Events** - Daily, weekly, monthly with exceptions | High |
| P1 | **Resource Booking** - Meeting rooms, equipment | Medium |
| P1 | **Time Zone Support** - Multi-timezone teams | High |
| P2 | **AI Scheduling** - Smart meeting time suggestions | High |

---

### 🟩 D. Tasks / Activities

**Current Gaps:**
- [ ] No time tracking
- [ ] No dependencies (Gantt)
- [ ] No workload view
- [ ] No sprint/iteration support

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Time Tracking** - Log hours per task dengan timer | High |
| P0 | **Task Dependencies** - Gantt chart view | High |
| P1 | **Workload View** - See team capacity | Medium |
| P1 | **Sprint Planning** - Agile iterations, velocity | Medium |
| P2 | **AI Task Breakdown** - Auto-break large tasks | Medium |

---

### 🟩 E. Forms

**Current Gaps:**
- [ ] No conditional logic
- [ ] No file upload fields
- [ ] No payment integration
- [ ] No form analytics

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Conditional Logic** - Show/hide fields based on answers | Very High |
| P0 | **File Upload Fields** - Attachments in forms | High |
| P1 | **Form Analytics** - Conversion rate, drop-off | Medium |
| P1 | **Payment Fields** - Collect payments via Stripe | High |
| P2 | **AI Form Generator** - Describe form, AI builds it | High |

---

### 🟩 F. Approvals

**Current Gaps:**
- [ ] No multi-level approvals
- [ ] No delegation
- [ ] No SLA tracking
- [ ] No mobile push notifications

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Multi-Level Approvals** - Sequential/parallel paths | Very High |
| P0 | **Delegation** - Auto-delegate when OOO | High |
| P1 | **SLA Tracking** - Alert when approval overdue | Medium |
| P1 | **Approval Templates** - Pre-built flows | Medium |
| P2 | **AI Auto-Approve** - Based on rules and history | Medium |

---

### 🟩 G. Analytics / BI

**Current Gaps:**
- [ ] No data connectors (MySQL, PostgreSQL)
- [ ] No cohort analysis
- [ ] No funnel visualization
- [ ] No custom SQL queries

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Data Connectors** - MySQL, PostgreSQL, Google Sheets | Very High |
| P0 | **Custom Dashboards** - Build unlimited dashboards | High |
| P1 | **Funnel Analysis** - Visualize conversion funnels | High |
| P1 | **Cohort Analysis** - User retention analysis | Medium |
| P2 | **AI Insights** - Auto-detected trends and anomalies | Very High |

---

### 🟩 H. Automations

**Current Gaps:**
- [ ] Limited trigger types
- [ ] No HTTP request action
- [ ] No loops/iterations
- [ ] No error handling

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **HTTP/Webhook Actions** - Call external APIs | Very High |
| P0 | **Error Handling** - Retry logic, fallbacks | High |
| P1 | **Loops** - Iterate over collections | Medium |
| P1 | **Scheduling** - Cron-based triggers | High |
| P2 | **AI Workflow Suggestions** - Recommend automations | Medium |

---

### 🟩 I. CRM

**Current Gaps:**
- [ ] No email integration
- [ ] No activity scoring
- [ ] No pipeline automation
- [ ] No quotation/proposal builder

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Email Integration** - Send/receive emails in CRM | Very High |
| P0 | **Lead Scoring** - Auto-score based on activities | High |
| P1 | **Pipeline Automation** - Auto-move deals, reminders | High |
| P1 | **Quotation Builder** - Visual quote/proposal creator | Medium |
| P2 | **AI Sales Assistant** - Next best action suggestions | High |

---

### 🟩 J. POS

**Current Gaps:**
- [ ] No offline mode
- [ ] No hardware integration (printer, scanner)
- [ ] No split payments
- [ ] No loyalty program

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Offline Mode** - Continue selling without internet | Very High |
| P0 | **Hardware Support** - Receipt printer, barcode scanner | High |
| P1 | **Split Payments** - Cash + card, multiple cards | Medium |
| P1 | **Loyalty Program** - Points, rewards | Medium |
| P2 | **AI Upsell** - Product recommendations | Medium |

---

### 🟩 K. Marketing

**Current Gaps:**
- [ ] No email builder
- [ ] No A/B testing
- [ ] No customer segmentation
- [ ] No campaign ROI tracking

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Email Builder** - Drag-drop email templates | Very High |
| P0 | **Customer Segments** - Dynamic segmentation | High |
| P1 | **A/B Testing** - Test variations | High |
| P1 | **Campaign Analytics** - ROI, attribution | High |
| P2 | **AI Copywriting** - Generate email/ad copy | High |

---

### 🟩 L. Inventory

**Current Gaps:**
- [ ] No barcode/QR generation
- [ ] No min/max stock alerts
- [ ] No batch/serial tracking
- [ ] No demand forecasting

**Improvement Suggestions:**
| Priority | Enhancement | Impact |
|----------|-------------|--------|
| P0 | **Stock Alerts** - Min/max threshold notifications | High |
| P0 | **Barcode/QR** - Generate and scan | High |
| P1 | **Batch/Serial Tracking** - Track individual items | Medium |
| P1 | **Multi-Warehouse** - Transfer, stock by location | High |
| P2 | **AI Demand Forecasting** - Predict stock needs | High |

---

## 📝 Architecture Notes

## 🧠 Feature Standard: `agents/` + `settings/` (Wajib)

Mulai sekarang **setiap feature** wajib menyediakan 2 “surface” agar Superspace bisa:
1) dipakai normal oleh user (UI + konfigurasi), dan
2) dipakai oleh AI agent secara aman (tools terkontrol + permission checks).

### 1) Folder wajib per feature

Untuk feature slug `X` (contoh: `reports`, `crm`, `inventory`) struktur minimalnya:

```txt
frontend/features/X/
  agents/        # AI-facing tools + prompts (client-side wrappers)
  settings/      # UI settings + persistence
  init.ts        # Register settings + (optional) register agent surface

convex/features/X/
  agents/        # Server-side tool handlers (queries/mutations/actions)
  queries.ts     # Domain queries (optional, tapi disarankan)
  mutations.ts   # Domain mutations (optional, tapi disarankan)
```

Catatan:
- `settings/` wajib ada walaupun hanya berisi 1 kategori “General”.
- `agents/` wajib ada walaupun awalnya hanya expose 1–2 tools read-only.

### 2) Tools wajib di `agents/`

Setiap feature minimal punya **tool set** berikut (boleh sederhana dulu):

| Tool group | Minimal tools | Tujuan |
|---|---|---|
| Read | `list`, `get` | Agent bisa ambil data aman untuk reasoning |
| Write | `create` atau `update` (pilih salah satu dulu) | Agent bisa eksekusi aksi kecil yang terukur |
| Policy | `canUser` / `permissions` check | Semua tool harus gated oleh permission |
| Explain | `summarize` / `describe` (read-only) | Agent bisa menjelaskan status feature ke user |

Prinsip implementasi tools:
- **Server-side source of truth**: tool handler ada di `convex/features/X/agents/*`.
- **RBAC first**: tiap handler wajib panggil permission guard (`requirePermission` / equivalent).
- **Small, composable tools**: hindari tool “doEverything”. Lebih baik 3 tools kecil.
- **Deterministic output**: tools return JSON sederhana; jangan return HTML.

### 3) Wajib: Dynamic Settings integration (`settings/`)

Semua feature wajib daftar settings ke registry via `init.ts` supaya:
- tombol Feature Settings di header bisa muncul saat feature aktif,
- settings bisa di-render tanpa hardcoded imports.

Pattern yang dipakai di repo ini:
- `frontend/shared/settings/featureSettingsRegistry.ts` (registry API)
- `frontend/features/<feature>/init.ts` (registerFeatureSettings)
- `frontend/features/<feature>/settings/*` (komponen settings)

Minimal isi `settings/`:
- `settings/index.ts` export semua SettingsSection
- `settings/<Feature>Settings.tsx` minimal 1 section (General)
- `settings/use<Feature>Settings.ts` (opsional) untuk persistence per-workspace/user

### 4) Checklist “Definition of Done” untuk feature baru

Sebelum feature dianggap siap, pastikan:
- `frontend/features/X/settings/` ada dan ter-register dari `frontend/features/X/init.ts`
- `frontend/features/X/agents/` ada dan minimal punya tool read-only
- `convex/features/X/agents/` ada dan semua handler sudah permission-gated
- Feature masuk ke manifest/registry (lazy-loaded page) sesuai pola `frontend/shared/foundation/manifest/registry.tsx`

### 5) Contoh nyata di repo (referensi)

- Settings: feature `reports` sudah punya `frontend/features/reports/settings/` dan `frontend/features/reports/init.ts`.
- Menu + install surface: `frontend/features/menu-store/` + backend `convex/features/menus/`.

---

### Repo anchors (implementation pointers)

- Backend menu system: `convex/features/menus/`
- Frontend menu UI (sidebar, tree, breadcrumbs): `frontend/shared/ui/layout/menus/`
- Feature settings registry (dynamic): `frontend/shared/settings/`
- Feature manifest/registry (lazy-loaded pages): `frontend/shared/foundation/manifest/registry.tsx`

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

*Last Updated: December 13, 2025 (agents/settings standard + project structure template)*
