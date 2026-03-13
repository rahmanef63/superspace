# 📚 ESSENTIAL READING: SuperSpace Onboarding Guide

> **Welcome to SuperSpace!** 🚀
> Whether you are a human developer or an AI Agent, this document is your absolute starting point. It synthesizes the core context, architectural mandates, available AI tools, and API integrations of the SuperSpace monorepo.

---

## 1. What is SuperSpace?

SuperSpace is a **"Unified App Builder"** and modular SaaS platform. Rather than building scattered, standalone applications, we build **Universal Features** that are composed into various business systems (CRM, ERP, HRIS, Projects, CMS).

### Tech Stack
- **Frontend:** Next.js 15 (App Router) + React 19 + TailwindCSS v4 + shadcn/ui
- **Backend:** Convex (Real-time Serverless Database)
- **Auth & Billing:** Clerk
- **Language:** TypeScript + Zod (Strict Validation)

---

## 2. The Golden Rules (Core Mandates)

If you write code for SuperSpace, you **MUST** follow these rules without exception:

1. **Zero Hardcoding**: Never hardcode lists of features or menus. Everything is auto-discovered via `config.ts`.
2. **Single Source of Truth (SSOT)**: A feature's `frontend/features/{slug}/config.ts` is the only place its metadata lives.
3. **Mandatory RBAC**: EVERY Convex query and mutation MUST verify user permissions using `requirePermission(ctx, workspaceId, 'permission.name')`.
4. **Audit Logging**: EVERY Convex mutation MUST record its action using `logAuditEvent(ctx, { ... })`.
5. **AI-Ready Surfaces**: Every feature must include two specific folders:
   - `agents/`: Exposes permission-gated Server-Side tools for AI agents.
   - `settings/`: Exposes dynamic UI configurations.

---

## 3. The "Dynamic Menu" Concept

Instead of building 150+ different menus for various apps, SuperSpace relies on **19 Universal Dynamic Menus** (e.g., Overview, Reports, Settings, Tasks, Files, Calendar). 
- **Efficiency:** 88% reduction in redundant code.
- **Implementation:** Menus map to specific Workspaces based on the active Industry Template (e.g., Accounting Firm vs. Clinic).

*For a full breakdown of the 19 menus, see `docs/features/00-ROADMAP.md`.*

---

## 4. AI Agents & Skills

SuperSpace is built to be manipulated and extended by AI. We have specialized agents and skills to enforce quality:

### 🛠️ superspace-architect (Gemini CLI Skill)
- **Location:** `.agents/skills/superspace-architect/SKILL.md`
- **Role:** Enforces the architectural guidelines (Zero Hardcoding, SSOT, RBAC).
- **When to use:** Activate this skill when planning new features, scaffolding new folders, or verifying structural integrity.

### 🕵️ Feature Auditor Agent (Claude / General)
- **Location:** `.claude/agents/feature-auditor.md`
- **Role:** An automated checklist agent.
- **When to use:** Run this agent to review a PR or a newly completed feature. It will check for the presence of `agents/`, `settings/`, `requirePermission`, and `logAuditEvent`.

---

## 5. External API & Integrations

SuperSpace is not a walled garden. Mature features (like CMS Lite, CRM, Projects) are exposed to external web applications via our API Gateway.

- **Gateway File:** `convex/http.ts` (Routes under `/api/v1/*`)
- **Authentication:** Bearer token (API Keys starting with `sk_live_...` scoped to Workspaces).
- **Documentation:** OpenAPI specs and REST documentation are located in `docs/api/`.

If you are building a feature that needs to be consumed externally, you must route it through the v1 API Gateway.

---

## 6. Next Steps

Before you write your first line of code or prompt:
1. **Read** `docs/00_BASE_KNOWLEDGE.md` for deep technical concepts.
2. **Review** `GEMINI.md` to understand prompt-level instructions.
3. **Explore** the `frontend/features/example/` directory to see a perfectly structured feature.

*Happy Building!* ✨