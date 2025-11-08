# 🧪 Change Property Type - Manual Test Checklist

**Feature**: Change Property Type  
**Test Date**: _____________________  
**Tester**: _____________________  
**Browser**: _____________________

---

## ✅ Setup Checklist

- [ ] Database table dengan minimal 5 rows
- [ ] Property dengan berbagai tipe (text, number, select, dll)
- [ ] Data test sudah disiapkan

---

## 📋 Test Cases

### 1️⃣ Text Conversions

#### **Text → Number**
- [ ] ✅ Value "123" diubah jadi number 123
- [ ] ✅ Value "45.67" diubah jadi number 45.67
- [ ] ✅ Value "abc" diubah jadi null (invalid)
- [ ] ✅ Value kosong diubah jadi null
- [ ] ✅ Warning muncul sebelum convert
- [ ] ✅ Data tersimpan dengan benar
- [ ] ❌ Error handling: _____________________

#### **Text → Select**
- [ ] ✅ Value "Option A, Option B" split jadi 2 select options
- [ ] ✅ Select options otomatis dibuat dengan warna random
- [ ] ✅ Value kosong jadi null
- [ ] ✅ Duplikat value di-handle dengan benar
- [ ] ❌ Error handling: _____________________

#### **Text → Checkbox**
- [ ] ✅ Value "true", "yes", "1" jadi checked (true)
- [ ] ✅ Value "false", "no", "0" jadi unchecked (false)
- [ ] ✅ Value lain jadi unchecked
- [ ] ✅ Checkbox terlihat dengan benar di table
- [ ] ❌ Error handling: _____________________

#### **Text → Date**
- [ ] ✅ ISO date string (2024-01-15) diparse dengan benar
- [ ] ✅ Invalid date jadi null
- [ ] ✅ Date picker berfungsi setelah convert
- [ ] ❌ Error handling: _____________________

---

### 2️⃣ Number Conversions

#### **Number → Text**
- [ ] ✅ Number 123 jadi string "123"
- [ ] ✅ Decimal 45.67 jadi string "45.67"
- [ ] ✅ Null tetap null
- [ ] ✅ Bisa edit sebagai text setelah convert
- [ ] ❌ Error handling: _____________________

#### **Number → Select**
- [ ] ✅ Number diubah jadi select option dengan nama number tersebut
- [ ] ✅ Select option otomatis dibuat
- [ ] ✅ Null tetap null
- [ ] ❌ Error handling: _____________________

#### **Number → Checkbox**
- [ ] ✅ Number > 0 jadi checked (true)
- [ ] ✅ Number <= 0 jadi unchecked (false)
- [ ] ✅ Null tetap null
- [ ] ❌ Error handling: _____________________

---

### 3️⃣ Select Conversions

#### **Select → Text**
- [ ] ✅ Select option "Option A" jadi text "Option A"
- [ ] ✅ Null tetap null
- [ ] ✅ **REVERSIBLE**: Text bisa diubah kembali ke Select
- [ ] ❌ Error handling: _____________________

#### **Select → Multi-Select**
- [ ] ✅ Single select jadi array [option]
- [ ] ✅ Select options di-preserve
- [ ] ✅ Bisa pilih multiple options setelah convert
- [ ] ✅ **REVERSIBLE**: Multi-select dengan 1 item bisa kembali ke Select
- [ ] ❌ Error handling: _____________________

#### **Select → Number**
- [ ] ✅ Option "123" diparse jadi number 123
- [ ] ✅ Option "abc" jadi null (lossy)
- [ ] ⚠️ Lossy warning muncul sebelum convert
- [ ] ❌ Error handling: _____________________

---

### 4️⃣ Multi-Select Conversions

#### **Multi-Select → Select**
- [ ] ✅ Array [option] jadi single option
- [ ] ✅ Array dengan multiple items ambil item pertama
- [ ] ⚠️ Lossy warning muncul (data hilang)
- [ ] ❌ Error handling: _____________________

#### **Multi-Select → Text**
- [ ] ✅ Array ["A", "B", "C"] jadi text "A, B, C"
- [ ] ✅ Join dengan comma dan space
- [ ] ✅ Null tetap null
- [ ] ❌ Error handling: _____________________

---

### 5️⃣ Checkbox Conversions

#### **Checkbox → Text**
- [ ] ✅ True jadi "true"
- [ ] ✅ False jadi "false"
- [ ] ✅ Null tetap null
- [ ] ❌ Error handling: _____________________

#### **Checkbox → Number**
- [ ] ✅ True jadi 1
- [ ] ✅ False jadi 0
- [ ] ✅ Null tetap null
- [ ] ❌ Error handling: _____________________

---

### 6️⃣ Date Conversions

#### **Date → Text**
- [ ] ✅ Date object jadi ISO string (YYYY-MM-DD)
- [ ] ✅ Format readable
- [ ] ✅ Null tetap null
- [ ] ✅ **REVERSIBLE**: Text ISO date bisa kembali ke Date
- [ ] ❌ Error handling: _____________________

#### **Date → Number**
- [ ] ✅ Date jadi timestamp (milliseconds)
- [ ] ✅ Null tetap null
- [ ] ⚠️ Lossy warning (tidak bisa kembali ke Date dengan mudah)
- [ ] ❌ Error handling: _____________________

---

## 🎨 UI/UX Testing

### Dialog Behavior
- [ ] ✅ Dialog buka dengan smooth animation
- [ ] ✅ Search box berfungsi (filter types)
- [ ] ✅ Current type disabled (tidak bisa pilih)
- [ ] ✅ Selected type highlighted dengan warna
- [ ] ✅ Icon untuk setiap type terlihat jelas
- [ ] ✅ Close button berfungsi
- [ ] ✅ ESC key menutup dialog
- [ ] ✅ Click outside menutup dialog

### Warning System
- [ ] ⚠️ Lossy conversion warning muncul (warna merah)
- [ ] ℹ️ Transformation description jelas
- [ ] ✅ Warning dapat dibaca dengan jelas
- [ ] ✅ User bisa cancel setelah lihat warning

### Performance
- [ ] ✅ Change type instant (<500ms untuk <100 rows)
- [ ] ✅ Tidak ada toast spam (only errors)
- [ ] ✅ Table update otomatis setelah convert
- [ ] ✅ Tidak ada reload yang tidak perlu
- [ ] ✅ UI responsive selama conversion

---

## 🐛 Error Handling

### Network Errors
- [ ] ✅ Offline mode: Error toast muncul
- [ ] ✅ Error message jelas: "Failed to change property type"
- [ ] ✅ Data tidak corrupt setelah error

### Invalid Data
- [ ] ✅ Schema mismatch: Error handled
- [ ] ✅ Convex mutation error: Toast muncul
- [ ] ✅ User bisa retry conversion

### Edge Cases
- [ ] ✅ Empty property (0 rows): Convert success
- [ ] ✅ Large dataset (>100 rows): Still works
- [ ] ✅ All null values: Convert success
- [ ] ✅ Mixed valid/invalid values: Valid converted, invalid null

---

## 🔄 Reversibility Tests

### Round-Trip Conversions
- [ ] ✅ Text → Select → Text (preserves data)
- [ ] ✅ Select → Multi-Select → Select (preserves option)
- [ ] ✅ Text → Number → Text (preserves number)
- [ ] ✅ Date → Text → Date (preserves date)
- [ ] ✅ Checkbox → Number → Checkbox (preserves state)

### Lossy Conversions (Expected to lose data)
- [ ] ⚠️ Multi-Select → Select (loses extra options)
- [ ] ⚠️ Text → Number (loses invalid text)
- [ ] ⚠️ Select → Number (loses option metadata)
- [ ] ⚠️ Date → Number (loses date format)

---

## 📊 Batch Processing

### Large Dataset
- [ ] ✅ 10 rows: Instant (<100ms)
- [ ] ✅ 50 rows: Fast (<300ms)
- [ ] ✅ 100 rows: Acceptable (<500ms)
- [ ] ✅ 500 rows: Works (may take 1-2s)
- [ ] ⚠️ Error tracking: Failed conversions reported

---

## 🎯 Integration Tests

### Menu System
- [ ] ✅ "Change type..." menu item terlihat
- [ ] ✅ RefreshCw icon muncul
- [ ] ✅ Menu item enabled (tidak disabled)
- [ ] ✅ Click menu item buka dialog

### Property Menu
- [ ] ✅ Menu tidak close setelah change type
- [ ] ✅ Property name tetap sama setelah change
- [ ] ✅ Property order tidak berubah
- [ ] ✅ Other properties tidak affected

### Table View
- [ ] ✅ Table re-render setelah type change
- [ ] ✅ Column header update dengan type icon baru
- [ ] ✅ Cell editor sesuai dengan type baru
- [ ] ✅ Sorting masih berfungsi
- [ ] ✅ Filtering masih berfungsi

---

## 📝 Notes & Issues

### Issues Found:
1. _____________________
2. _____________________
3. _____________________

### Performance Notes:
- _____________________
- _____________________

### Browser Compatibility:
- Chrome: _____________________
- Firefox: _____________________
- Safari: _____________________
- Edge: _____________________

---

## ✅ Final Checklist

- [ ] All basic conversions work (23×23 matrix)
- [ ] Error handling robust (no crashes)
- [ ] Toast notifications appropriate (errors only)
- [ ] Performance acceptable (<500ms for normal datasets)
- [ ] UI/UX smooth (no jank)
- [ ] Reversible conversions preserve data
- [ ] Lossy conversions show warnings
- [ ] Documentation complete
- [ ] Tests passing (44/44)
- [ ] Ready for production

---

## 🚀 Sign-Off

**Tested By**: _____________________  
**Date**: _____________________  
**Status**: ⬜ PASS | ⬜ FAIL | ⬜ NEEDS REVISION  
**Comments**: 

_____________________
_____________________
_____________________

---

**Version**: 1.0  
**Last Updated**: November 6, 2025
