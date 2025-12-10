# Landing Page Mockup Workspace Plan

## Overview

Landing page akan menampilkan dashboard SuperSpace yang sama persis dengan yang dilihat user setelah login, tetapi menggunakan **mock data** dan **mock workspace** untuk demonstrasi.

## Struktur Mock Workspace

### 1. Workspace Templates (10 templates)

```
Mock Workspaces:
├── 🏠 Keluarga Harmonis (Family)
│   ├── 👨 Ayah
│   ├── 👩 Ibu  
│   ├── 👦 Kakak
│   └── 👧 Adik
│
├── 🏢 Startup Tech (Business)
│   ├── Engineering
│   ├── Product
│   ├── Marketing
│   └── Operations
│
├── 🎓 Universitas (Education)
│   ├── Semester 1
│   ├── Semester 2
│   └── Research
│
├── 🏪 Toko Online (E-Commerce)
│   ├── Products
│   ├── Orders
│   └── Customers
│
├── 🎨 Creative Agency (Creative)
│   ├── Design
│   ├── Development
│   └── Client Projects
│
├── 🏥 Klinik Sehat (Healthcare)
│   ├── Patients
│   ├── Appointments
│   └── Inventory
│
├── 🏗️ Konstruksi (Construction)
│   ├── Projects
│   ├── Materials
│   └── Workers
│
├── 🍽️ Restoran (F&B)
│   ├── Menu
│   ├── Orders
│   └── Inventory
│
├── 🏋️ Fitness Center (Sports)
│   ├── Members
│   ├── Classes
│   └── Equipment
│
└── 📚 Library (Knowledge)
    ├── Books
    ├── Members
    └── Events
```

### 2. Feature Label Mapping

Setiap workspace akan memiliki label yang di-customize sesuai konteks:

| Feature | Keluarga | Startup | Restoran |
|---------|----------|---------|----------|
| Inventory | Bahan Dapur | Assets | Stok Bahan |
| Tasks | Tugas Rumah | Sprints | Pesanan |
| Communications | Chat Keluarga | Team Chat | Staff Chat |
| Documents | Dokumen Keluarga | Wiki | Resep |
| CRM | Kontak Keluarga | Clients | Pelanggan |
| Calendar | Jadwal Keluarga | Meetings | Reservasi |
| Analytics | Pengeluaran | Metrics | Penjualan |

### 3. Mock Data Structure

```typescript
// frontend/shared/preview/landing/types.ts

interface MockWorkspace {
  id: string
  name: string
  description: string
  icon: string
  color: string
  template: WorkspaceTemplate
  subWorkspaces?: MockWorkspace[]
  features: MockFeatureConfig[]
  members: MockMember[]
}

interface MockFeatureConfig {
  featureId: string
  label: string // Custom label per workspace
  icon?: string
  mockData: unknown
  enabled: boolean
}

interface MockMember {
  id: string
  name: string
  avatar?: string
  role: string
}
```

### 4. Implementation Steps

#### Phase 1: Core Infrastructure
1. [ ] Create `frontend/shared/preview/landing/` directory
2. [ ] Define mock workspace types
3. [ ] Create workspace templates with mock data
4. [ ] Create label mapping system

#### Phase 2: Mock Data Generation
1. [ ] Create mock data for each feature per workspace type
2. [ ] Create mock members/users
3. [ ] Create mock conversations, tasks, documents, etc.

#### Phase 3: Landing Page Integration
1. [ ] Create `MockWorkspaceProvider` - provides mock context instead of real Convex
2. [ ] Create `MockAppSidebar` - sidebar with mock workspaces
3. [ ] Modify feature components to accept mock data prop
4. [ ] Create workspace switcher for landing page

#### Phase 4: Polish
1. [ ] Add animations and transitions
2. [ ] Add "Sign up to create your own" CTAs
3. [ ] Add feature highlights/tooltips
4. [ ] Mobile responsive design

### 5. Technical Approach

```tsx
// Option A: Separate Mock Components (Current approach - not ideal)
// Duplicates UI code

// Option B: Shared Components with Data Injection (Recommended)
// Same UI components, different data source

// Implementation:
// 1. Create MockDataContext that provides mock data
// 2. Feature components check if in "demo mode"
// 3. If demo mode, use mock data from context
// 4. If authenticated, use real Convex data
```

### 6. File Structure

```
frontend/shared/preview/landing/
├── index.ts                    # Public exports
├── types.ts                    # TypeScript types
├── context/
│   ├── MockWorkspaceContext.tsx
│   └── MockDataContext.tsx
├── data/
│   ├── workspaces/
│   │   ├── family.ts           # Keluarga Harmonis
│   │   ├── startup.ts          # Startup Tech
│   │   ├── restaurant.ts       # Restoran
│   │   └── ...
│   ├── features/
│   │   ├── communications.ts
│   │   ├── tasks.ts
│   │   ├── inventory.ts
│   │   └── ...
│   └── members.ts
├── components/
│   ├── LandingDashboard.tsx    # Main landing dashboard
│   ├── MockSidebar.tsx         # Sidebar with mock data
│   ├── WorkspaceDemo.tsx       # Interactive workspace demo
│   └── FeatureShowcase.tsx     # Feature highlights
└── hooks/
    ├── useMockWorkspace.ts
    └── useMockData.ts
```

### 7. Key Decisions

1. **Same UI, Different Data Source**: Feature components will be reused, only data source changes
2. **Context-based Demo Mode**: A context will indicate if we're in demo mode
3. **Lazy Loading**: Mock data loaded on-demand when workspace/feature is selected
4. **Interactive but Read-only**: Users can interact (click, search) but no persistence
5. **Sign-up Prompts**: Strategic CTAs encourage users to create their own workspace

### 8. Success Criteria

- [ ] Landing page loads fast (< 2s)
- [ ] All 10 workspace templates visible
- [ ] Nested workspaces (e.g., Keluarga > Ayah) work correctly
- [ ] Feature labels change per workspace context
- [ ] All features show realistic mock data
- [ ] Mobile responsive
- [ ] Clear CTAs to sign up

## Next Steps

1. Fix current TypeScript error (add 'business' to FeaturePreviewCategory)
2. Create the landing preview infrastructure
3. Start with 1 workspace template (Keluarga Harmonis)
4. Expand to other templates
