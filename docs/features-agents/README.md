# Feature Agents (AI CRUD Superspace)

Tujuan: AI bisa CRUD semua feature Superspace dengan aman lewat sub-agent per feature. Orchestrator menerima permintaan user, merutekan ke sub-agent (POS, Approvals, Audit Log, Projects, dsb), dan user juga bisa langsung memilih agent per feature di UI.

## Arsitektur Singkat
- Orchestrator Agent: satu pintu masuk, mendeteksi intent, workspace, dan feature lalu memanggil sub-agent; enforce RBAC + logging.
- Feature Sub-Agent: per modul di `convex/features/<feature>`, expose tool CRUD (queries + mutations) yang aman untuk AI.
- Tool Surface: gunakan Convex actions sebagai tool-call yang memanggil `api.features.<feature>.<mutations|queries>` agar type-safe dan tercatat.
- User Entry Points: UI menyediakan opsi bertanya ke "Global AI" atau langsung ke agent feature (mis. "POS Agent", "Approvals Agent").

## Backend (Convex) Checklist
1) Registri sub-agent (disarankan): buat `convex/features/ai/featureAgents.ts` berisi metadata dan daftar tool per feature.
```ts
export const featureAgents = {
  pos: {
    name: "POS Agent",
    description: "CRUD produk, transaksi, diskon, loyalty",
    tools: [
      { name: "pos.listProducts", call: api.features.pos.queries.getProducts },
      { name: "pos.createProduct", call: api.features.pos.mutations.createProduct },
      { name: "pos.updateProduct", call: api.features.pos.mutations.updateProduct },
      { name: "pos.getSalesReport", call: api.features.pos.queries.getSalesReport },
    ],
  },
  approvals: {
    name: "Approvals Agent",
    description: "Kelola approval request dan status",
    tools: [/* map ke mutations/queries approvals */],
  },
  // tambahkan feature lain sesuai folder convex/features
} as const;
```
2) Guardrails standar:
- Semua tool wajib memanggil `requireActiveMembership` dan memverifikasi `workspaceId`.
- Batasi operation matrix: create/update/delete hanya untuk data milik workspace; gunakan soft delete jika ada.
- Sanitasi input AI: normalisasi enum, date, number; fallback default jika field optional tidak dikirim.
- Audit: catat setiap panggilan via `auditLog`/usage metrics (bisa lewat action wrapper sebelum meneruskan ke mutation/query).

3) Action gateway untuk AI:
- Buat action mis. `callFeatureAgent` yang menerima `{ workspaceId, featureKey, toolName, args, userId }` lalu:
  - validasi akses
  - load tool dari registri
  - jalankan `ctx.runMutation`/`ctx.runQuery`
  - tulis audit + usage
- Gunakan action ini sebagai "tool" tunggal yang dipanggil orchestrator LLM agar routing konsisten.

4) Konteks data untuk reasoning:
- Reuse `aiSettings` untuk provider/model, dan `knowledgeBaseDocuments` sebagai konteks ketika agent perlu referensi dokumentasi.
- Untuk list panjang, gunakan query yang sudah ada (mis. `getProducts`, `getTransactions`) dengan limit/pagination agar AI tidak overload.

5) Testing minimal:
- Unit test untuk action gateway: izin salah, tool tidak dikenal, workspace mismatch, success path.
- Smoke test tiap tool AI untuk satu feature (create -> read -> update -> delete jika tersedia).

## Frontend (AI UX) Checklist
- Registri front-end: mirror registri backend di file seperti `frontend/features/ai/featureAgents.ts` agar UI tahu label/ikon/tool hint.
- Pemilihan agent: di Chat/AI view, sediakan dropdown/chips untuk memilih `global` atau `featureKey`. Default ke orchestrator; jika user memilih POS maka prompt langsung diarahkan ke sub-agent POS.
- Hook: gunakan `useAction`/`useMutation` Convex untuk memanggil action gateway; sertakan `workspaceId` dari context.
- Layout: pakai komponen `ThreeColumnLayoutAdvanced` (lihat `docs/guides/three-column-layout-usage.md`) untuk list session, chat, dan detail panel agent.
- Feedback: tampilkan tool-call trace ringan (tool + args singkat) agar user paham apa yang dilakukan agent.

## Contoh Pemetaan Feature
- POS Agent (convex/features/pos):
  - Read: `getData`, `getProducts`, `getTransactions`, `getTodaySales`, `getSalesReport`.
  - Write: `createProduct`, `updateProduct`, `createTransaction`, `refundTransaction`, `voidTransaction`, `createDiscount`, `enrollCustomerLoyalty`, `redeemLoyaltyPoints`.
  - Konteks wajib: `workspaceId`; beberapa tool perlu `userId` (ambil via `resolveCandidateUserIds`).
- Approvals Agent (convex/features/approvals): CRUD request, update status, add comment.
- Audit Log Agent (convex/features/auditLog): search/filter log; hanya read, tidak ada write.
- Tambahkan modul lain dengan pola sama (CRM, Projects, Inventory, dll.).

## Alur Permintaan Natural Language
1) User kirim prompt -> orchestrator.
2) Orchestrator identifikasi feature (opsional: tanya balik jika ambigu) dan pilih sub-agent.
3) Sub-agent memilih tool dari registri, memanggil action gateway, lalu merangkum hasil ke user.
4) Semua panggilan tercatat di audit/usage untuk monitoring dan rollback.

## Direct Agent Entry per Feature
- Tambah CTA di setiap view feature (mis. tombol "Tanya AI" di POS) yang memanggil chat dengan `featureKey` preset.
- Sertakan contoh prompt di UI sesuai feature ("Tambah produk baru", "Refund transaksi kemarin", "Setujui request pending").
- Propagasi `workspaceId`/`contextId` dari halaman agar AI langsung siap CRUD tanpa tanya ulang.

## Checklist Cepat Saat Menambah Sub-Agent Baru
- [ ] Daftarkan feature + tools di registri backend dan frontend.
- [ ] Pastikan semua tool memanggil `requireActiveMembership` dan memverifikasi workspace.
- [ ] Audit + usage logging aktif.
- [ ] Tambah CTA di UI feature untuk akses langsung agent.
- [ ] Smoke test CRUD via action gateway.
