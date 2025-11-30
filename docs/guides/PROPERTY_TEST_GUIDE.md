# 🎯 Property Type System - Quick Test Guide

## 🚀 Cara Test Property Type System

### Step 1: Buka Database Table
1. Buka aplikasi di browser: `http://localhost:3000`
2. Navigate ke **Dashboard** → pilih workspace
3. Buka database yang sudah ada atau buat baru
4. Pastikan ada beberapa rows dengan data

---

## 🧪 Test Scenarios (Prioritas Tinggi)

### ✅ Test 1: Change Property Type (Text → Number)
**Lokasi:** Klik **header kolom** → **•••** (three dots) → **Change type**

**Steps:**
1. Buat kolom baru type **Text**
2. Isi dengan data:
   - Row 1: `123`
   - Row 2: `45.67`
   - Row 3: `abc` (ini akan jadi null)
   - Row 4: kosongkan
3. Klik header kolom → **•••** → **Change type**
4. Pilih **Number**
5. Dialog muncul dengan warning
6. Klik **Change Type**

**Expected Results:**
- ✅ Row 1: `123` (number)
- ✅ Row 2: `45.67` (number)
- ✅ Row 3: `null` (invalid text)
- ✅ Row 4: `null` (empty)
- ✅ Toast muncul: "Property type changed successfully"

---

### ✅ Test 2: Input Debouncing (No Toast Spam)
**Lokasi:** Edit cell di table

**Steps:**
1. Klik cell dengan type **Text** atau **Rich Text**
2. Ketik: `T` `e` `s` `t`
3. Tunggu 1 detik
4. Lihat toast notification

**Expected Results:**
- ❌ Toast **TIDAK** muncul setiap keystroke
- ✅ Toast muncul **hanya sekali** setelah 1 detik
- ✅ Text tersimpan dengan benar

**Test Keyboard Shortcuts:**
- Press **Enter** → Toast langsung muncul, cursor blur
- Press **Escape** → Edit dibatalkan, value revert

---

### ✅ Test 3: Drag & Drop Columns
**Lokasi:** Table header

**Steps:**
1. Hover di header kolom (icon drag muncul)
2. Drag kolom ke posisi lain
3. Drop
4. Refresh page

**Expected Results:**
- ✅ Kolom berpindah posisi
- ✅ Order tersimpan (persistent setelah refresh)
- ✅ No console errors

---

### ✅ Test 4: Drag & Drop Rows
**Lokasi:** Table rows (handle icon di kiri)

**Steps:**
1. Hover di kiri row (drag handle muncul)
2. Drag row ke posisi lain
3. Drop
4. Refresh page

**Expected Results:**
- ✅ Row berpindah posisi
- ✅ Order tersimpan (persistent)
- ✅ No console errors

---

### ✅ Test 5: Property Menu (Notion-style)
**Lokasi:** Klik **•••** di header kolom

**Steps:**
1. Klik **•••** (three dots) di header kolom
2. Menu muncul dengan banyak options

**Expected Results:**
- ✅ Menu items muncul:
  - Rename
  - Change type
  - Duplicate
  - Hide in view
  - Sort ascending
  - Sort descending
  - Filter
  - Wrap cells
  - Copy property link
  - Delete
- ✅ Icon sesuai dengan action
- ✅ Disabled items di-grey out
- ✅ Klik action → dialog/action executed

---

### ✅ Test 6: Select & Multi-Select
**Lokasi:** Cell dengan type Select

**Steps:**
1. Buat kolom type **Select**
2. Klik cell → dropdown muncul
3. Pilih option atau ketik untuk create new
4. Change type ke **Multi-Select**
5. Pilih multiple options

**Expected Results:**
- ✅ Single select: 1 option terpilih
- ✅ Multi-select: multiple options terpilih
- ✅ Options dengan warna berbeda
- ✅ Conversion reversible (no data loss)

---

### ✅ Test 7: Checkbox Type
**Lokasi:** Cell dengan type Checkbox

**Steps:**
1. Buat kolom type **Checkbox**
2. Klik checkbox untuk toggle
3. Change type dari **Text** (`yes`/`no`) ke **Checkbox**

**Expected Results:**
- ✅ Checkbox toggle smooth
- ✅ Value tersimpan: `true`/`false`
- ✅ Text conversion: `"yes"` → `true`, `"no"` → `false`

---

### ✅ Test 8: Date & Time
**Lokasi:** Cell dengan type Date

**Steps:**
1. Buat kolom type **Date**
2. Klik cell → date picker muncul
3. Pilih tanggal
4. Convert dari **Text** (`2024-01-15`) ke **Date**

**Expected Results:**
- ✅ Date picker UI muncul
- ✅ Tanggal tersimpan sebagai timestamp
- ✅ Display format: human-readable
- ✅ Text → Date conversion works

---

## 🐛 Common Issues & Solutions

### Issue 1: Toast Muncul Setiap Keystroke
**Symptom:** Toast spam saat mengetik  
**Solution:** ✅ Sudah fixed dengan debouncing (1 detik delay)  
**Verify:** Ketik beberapa karakter, tunggu, toast muncul sekali

---

### Issue 2: Drag & Drop Tidak Save
**Symptom:** Setelah refresh, order kembali ke original  
**Solution:** ✅ Sudah fixed dengan unified DndContext  
**Verify:** Refresh page, order tetap persistent

---

### Issue 3: forwardRef Warning
**Symptom:** Warning di console: "Function components cannot be given refs"  
**Solution:** ✅ Sudah suppressed di SafeClerkProvider  
**Verify:** Console clean, no warnings

---

### Issue 4: "Failed to fetch RSC payload"
**Symptom:** Network error di console  
**Solution:** Next.js dev mode issue, not critical  
**Fix:** Refresh page atau restart dev server
```bash
# PowerShell
Remove-Item -Recurse -Force .next
pnpm dev
```

---

## 📊 Test Results Tracking

| Test Case | Status | Notes |
|-----------|--------|-------|
| Change Type (Text → Number) | ⬜ | |
| Input Debouncing | ⬜ | |
| Drag & Drop Columns | ⬜ | |
| Drag & Drop Rows | ⬜ | |
| Property Menu | ⬜ | |
| Select & Multi-Select | ⬜ | |
| Checkbox | ⬜ | |
| Date & Time | ⬜ | |

**Legend:** ✅ Pass | ❌ Fail | ⚠️ Issue | ⬜ Not Tested

---

## 🎯 Quick Test Commands

### Run All Tests
```bash
pnpm test
```

### Run Property Tests Only
```bash
pnpm test property
```

### Run with Coverage
```bash
pnpm test:coverage
```

### Run in UI Mode
```bash
pnpm test:ui
```

---

## 🔍 Where to Find Features

### 1. Property Type Registry
**File:** `frontend/features/database/properties/registry.ts`  
**Purpose:** Auto-discovery of all property types

### 2. Change Type Dialog
**File:** `frontend/features/database/components/PropertyMenu/dialogs/ChangePropertyTypeDialog.tsx`  
**Access:** Header kolom → **•••** → **Change type**

### 3. Data Transformer
**File:** `frontend/features/database/lib/dataTransformer.ts`  
**Purpose:** Handle semua konversi antar property types

### 4. Property Menu
**File:** `frontend/features/database/components/PropertyMenu/PropertyMenu.tsx`  
**Access:** Klik **•••** di header kolom

### 5. Editable Cell
**File:** `frontend/features/database/components/views/table/components/EditableCell.tsx`  
**Purpose:** Inline editing dengan debouncing

---

## 📝 Test Notes

### Debouncing Behavior
- **Text inputs**: 1000ms delay (1 detik)
- **Select/Checkbox**: Immediate commit (no delay)
- **Enter key**: Immediate commit + blur
- **Escape key**: Cancel + revert

### Drag & Drop Behavior
- **Columns**: Drag from header
- **Rows**: Drag from left handle
- **Auto-save**: Changes persist automatically
- **Single DndContext**: Handles both columns and rows

### Property Type Conversions
- **Reversible**: Text ⇄ Number, Select ⇄ Multi-Select
- **Lossy**: Multi-Select → Select (only first option kept)
- **Smart**: Text "yes" → Checkbox true, Text "123" → Number 123

---

## ✅ Success Criteria

Feature dianggap sukses jika:
1. ✅ Change type works tanpa error
2. ✅ No toast spam saat mengetik
3. ✅ Drag & drop persistent setelah refresh
4. ✅ Console clean (no errors/warnings)
5. ✅ Data transformations accurate
6. ✅ UI responsive dan smooth
7. ✅ Keyboard shortcuts work
8. ✅ All menu actions functional

---

**Happy Testing! 🎉**
