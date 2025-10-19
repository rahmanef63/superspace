# Dokumentasi SuperSpace

> **Pusat dokumentasi lengkap untuk memahami, mengembangkan, dan memelihara SuperSpace**
>
> Last Updated: 2025-01-19

---

## 🎯 Navigasi Dokumentasi

Dokumentasi ini dirancang untuk berbagai audiens dengan kebutuhan berbeda:

### 📖 **Untuk Semua Orang**

**[1. System Overview](./1_SYSTEM_OVERVIEW.md)** - Mulai di sini!
- Arsitektur sistem SuperSpace
- Konsep kunci (RBAC, Feature Packages, Menu System)
- Diagram alur data
- Gambaran besar proyek

### 👨‍💻 **Untuk Developer**

**[2. Developer Guide](./2_DEVELOPER_GUIDE.md)** - Panduan lengkap development
- Step-by-step membuat fitur baru
- Best practices (Dynamic Import Pattern, RBAC, Audit Logging)
- Testing guidelines
- CI/CD workflow
- Troubleshooting umum

### 🤖 **Untuk AI Agent & Expert Developer**

**[3. AI Knowledge Base](./3_AI_KNOWLEDGE_BASE.md)** - Informasi teknis padat
- Lokasi file kritis
- Code patterns & snippets
- Critical issues & fixes
- Instruksi spesifik untuk AI

### 🐛 **Untuk Problem Solving**

**[4. Troubleshooting](./4_TROUBLESHOOTING.md)** - Solusi masalah umum
- Workspace tidak punya menu
- Feature tidak muncul di Menu Store
- Permission denied errors
- Script & query debugging

### 📚 **Untuk Quick Reference**

**[5. Feature Reference](./5_FEATURE_REFERENCE.md)** - Referensi cepat
- Daftar lengkap semua fitur
- Slug & version info
- Installation examples
- API reference

---

## 🚀 Quick Start

### Membuat Fitur Baru

```bash
# 1. Scaffold fitur baru
pnpm run scaffold:feature reports --type optional --category analytics

# 2. Implementasi (edit files di frontend/ dan convex/)

# 3. Sync semua auto-generated files
pnpm run sync:all

# 4. Validasi & test
pnpm run validate:all
pnpm test

# 5. Commit
git add .
git commit -m "feat: add reports feature"
```

### Perintah Penting

```bash
# Feature Management
pnpm run scaffold:feature {slug}     # Buat fitur baru
pnpm run sync:all                    # Sync manifest & catalog
pnpm run generate:manifest           # Generate manifest.tsx saja
pnpm run validate:features           # Validate features.config.ts

# Validation (WAJIB sebelum commit)
pnpm run validate:all                # Jalankan semua validator
pnpm test                            # Jalankan semua test

# Development
pnpm dev                             # Start Next.js dev server
npx convex dev                       # Start Convex dev server
```

---

## 📊 Status Proyek

**Overall Progress:** 68% Complete (28/41 tasks)

| Kategori | Status |
|----------|--------|
| Core System | 🟡 83% (10/12) |
| Default Features | 🟢 85% (11/13) |
| Optional Features | 🔴 17% (1/6) |
| Infrastructure | 🟢 88% (7/8) |

**Critical Issues:** ✅ Fixed (Workspace bootstrap menu creation)

Lihat [FEATURE_STATUS.md](./FEATURE_STATUS.md) untuk detail lengkap.

---

## 🏗️ Arsitektur Overview

```
┌─────────────────────────────────────────────┐
│        features.config.ts                   │
│        (Single Source of Truth)             │
└────────────────┬────────────────────────────┘
                 │
        ┌────────┴────────┐
        │  sync:all       │
        └────────┬────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
    ▼                         ▼
┌─────────────┐      ┌──────────────────┐
│   Manifest  │      │   Component      │
│   (Convex)  │      │   Registry       │
│             │      │   (Frontend)     │
└─────────────┘      └──────────────────┘
```

**Prinsip Utama:**
- ✅ **DRY:** Hanya edit `features.config.ts`
- ✅ **Type-Safe:** Zod validation + TypeScript
- ✅ **Auto-Generated:** Manifest & registry auto-generate
- ✅ **RBAC:** Permission checks di semua endpoint
- ✅ **Audit:** Log semua mutations

---

## 📁 Struktur Folder

```
project/
├── features.config.ts              # ⭐ Single source of truth
│
├── frontend/
│   ├── features/
│   │   ├── default/                # Default features
│   │   │   ├── overview/
│   │   │   ├── wa/
│   │   │   └── members/
│   │   └── optional/               # Optional features
│   │       ├── documents/
│   │       ├── reports/
│   │       └── calendar/
│   └── shared/
│       ├── components/             # Shared UI
│       ├── hooks/
│       └── pages/
│           └── manifest.tsx        # ⚙️ Auto-generated
│
├── convex/
│   ├── features/                   # Mirror frontend/features
│   ├── menu/store/
│   │   ├── menu_manifest_data.ts   # ⚙️ Auto-generated
│   │   └── optional_features_catalog.ts  # ⚙️ Auto-generated
│   └── schema.ts
│
├── tests/
│   └── features/
│
├── scripts/
│   ├── scaffold-feature.ts
│   ├── sync-features.ts
│   ├── generate-manifest.ts        # ✨ New!
│   └── validate-*.ts
│
└── docs/                           # 📚 You are here
    ├── README.md
    ├── 1_SYSTEM_OVERVIEW.md
    ├── 2_DEVELOPER_GUIDE.md
    ├── 3_AI_KNOWLEDGE_BASE.md
    ├── 4_TROUBLESHOOTING.md
    └── 5_FEATURE_REFERENCE.md
```

---

## 🎯 Definition of Done (DoD)

Sebelum menandai task sebagai complete, pastikan:

- [ ] ✅ Schema validated (Zod scripts OK)
- [ ] ✅ RBAC checks implemented
- [ ] ✅ Audit events logged
- [ ] ✅ Tests written & passing (unit + integration)
- [ ] ✅ Documentation updated
- [ ] ✅ CI/CD passes
- [ ] ✅ Code reviewed

---

## 🔗 Link Penting

### Internal
- [features.config.ts](../features.config.ts) - Feature definitions
- [convex/schema.ts](../convex/schema.ts) - Database schema
- [.claude/CLAUDE.md](../.claude/CLAUDE.md) - Project guardrails

### External
- [Convex Docs](https://docs.convex.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Zod Docs](https://zod.dev)

---

## 📞 Bantuan & Support

1. **Cari di dokumentasi ini terlebih dahulu**
2. Check [Troubleshooting Guide](./4_TROUBLESHOOTING.md)
3. Check GitHub Issues
4. Tanya di team chat
5. Buat GitHub Issue baru

---

## 🔄 Changelog Dokumentasi

| Date | Changes | Author |
|------|---------|--------|
| 2025-01-19 | Konsolidasi 23 file .md menjadi 6 file terstruktur | Claude |
| 2025-01-19 | Tambah script generate-manifest.ts | Claude |
| 2025-01-19 | Update struktur folder (default/ & optional/) | Claude |

---

**Next Review:** 2025-01-26
**Maintained by:** Development Team
