# Property Type Transformation System

**Created:** November 9, 2025  
**Feature:** Universal Database  
**Status:** ✅ Complete

---

## 🎯 Overview

Sistem transformasi property type yang intelligent untuk mengkonversi data ketika tipe property berubah. Sistem ini memastikan **data tidak hilang** dan melakukan **smart conversion** sesuai konteks.

### Key Features
- ✅ **23 property types** fully supported
- ✅ **Smart transformations** - context-aware conversions
- ✅ **Data preservation** - extract useful information
- ✅ **Auto-generation** - create options automatically
- ✅ **Validation** - type-safe conversions
- ✅ **Statistics** - transformation success tracking

---

## 📊 Transformation Matrix

### Common Conversions

| From → To | Transformation Rule | Example |
|-----------|---------------------|---------|
| **Text → Number** | Extract numeric values, remove letters | "Price: $123.45" → 123.45 |
| **Text → Select** | Split by comma, create options | "Red, Blue, Green" → [Red, Blue, Green] options |
| **Text → Checkbox** | Recognize true/false keywords | "yes" → ✓, "no" → ☐ |
| **Number → Text** | Convert to string | 123.45 → "123.45" |
| **Number → Checkbox** | Zero = unchecked, non-zero = checked | 0 → ☐, 1 → ✓ |
| **Select → Checkbox** | Match true/false labels | "Yes" option → ✓ |
| **Select → Multi_Select** | Convert single to array | "Red" → ["Red"] |
| **Multi_Select → Select** | Use first value | ["Red", "Blue"] → "Red" |
| **Checkbox → Select** | Create Yes/No options | ✓ → "Yes" option |
| **Date → Number** | Convert to timestamp | "2024-01-01" → 1704067200000 |
| **Date → Text** | Format as locale string | Date → "1/1/2024" |

---

## 🔄 Detailed Transformation Rules

### 1. TO TEXT/RICH_TEXT/TITLE
**Philosophy:** Almost everything can be represented as text.

```typescript
// Number → Text
123.45 → "123.45"

// Checkbox → Text  
true → "Yes"
false → "No"

// Date → Text
Date(2024-01-01) → "1/1/2024"

// Select → Text (get label)
option-id → "Option Label"

// Multi_Select → Text (join labels)
[option-1, option-2] → "Label 1, Label 2"

// URL/Email/Phone → Text (preserve value)
"https://example.com" → "https://example.com"

// People → Text (warning: loses references)
[user-1, user-2] → "user-1, user-2"

// Files → Text (warning: loses attachments)
[{name: "doc.pdf"}] → "doc.pdf"
```

---

### 2. TO NUMBER
**Philosophy:** Extract numeric values, discard non-numeric.

```typescript
// Text → Number (extract first number)
"Price: $123.45 USD" → 123.45
"abc" → 0 (warning: no numbers found)
"-45.67" → -45.67

// Checkbox → Number
true → 1
false → 0

// Select → Number (extract from label)
"Option 5" → 5
"No numbers" → 0 (warning)

// Date → Number (timestamp)
Date(2024-01-01) → 1704067200000
```

---

### 3. TO SELECT
**Philosophy:** Create options from values, use first as selection.

```typescript
// Text → Select (split and create options)
"Red, Blue, Green" → {
  value: "option-0",
  options: [
    {id: "option-0", label: "Red", color: "gray"},
    {id: "option-1", label: "Blue", color: "gray"},
    {id: "option-2", label: "Green", color: "gray"}
  ]
}

// Multi_Select → Select (use first)
["option-1", "option-2"] → "option-1"
(warning: multiple values, using first)

// Number → Select (create single option)
42 → {
  value: "option-0",
  options: [{id: "option-0", label: "42", color: "gray"}]
}

// Checkbox → Select (create Yes/No options)
true → {
  value: "yes",
  options: [
    {id: "yes", label: "Yes", color: "green"},
    {id: "no", label: "No", color: "gray"}
  ]
}
```

---

### 4. TO MULTI_SELECT
**Philosophy:** Create multiple options from comma-separated values.

```typescript
// Text → Multi_Select (split and select all)
"Red, Blue, Green" → {
  value: ["option-0", "option-1", "option-2"],
  options: [
    {id: "option-0", label: "Red", color: "gray"},
    {id: "option-1", label: "Blue", color: "gray"},
    {id: "option-2", label: "Green", color: "gray"}
  ]
}

// Select → Multi_Select (convert to array)
"option-1" → ["option-1"]
```

---

### 5. TO CHECKBOX
**Philosophy:** Recognize truthy/falsy values from various formats.

```typescript
// Text → Checkbox
"true" → true
"yes" → true
"1" → true
"checked" → true
"on" → true
"enabled" → true

"false" → false
"no" → false
"0" → false
"unchecked" → false
"off" → false
"disabled" → false

"maybe" → false (warning: not recognized)

// Number → Checkbox
0 → false
1 → true
-5 → true (non-zero)
42 → true (non-zero)

// Select → Checkbox (match label)
"Yes" option → true
"True" option → true
"No" option → false
```

---

### 6. TO DATE
**Philosophy:** Parse date strings, use timestamps, default to today.

```typescript
// Text → Date
"2024-01-01" → Date(2024-01-01)
"January 1, 2024" → Date(2024-01-01)
"invalid" → Date(today) (warning)

// Number → Date (timestamp)
1704067200000 → Date(2024-01-01)

// Created_Time/Last_Edited_Time → Date
(preserve existing date value)
```

---

### 7. TO URL
**Philosophy:** Add protocol if missing, validate format.

```typescript
// Text → URL
"example.com" → "https://example.com"
"https://example.com" → "https://example.com"
"invalid url" → "invalid url" (warning)

// Email → URL
"user@example.com" → "mailto:user@example.com"
```

---

### 8. TO EMAIL
**Philosophy:** Validate email format, extract from mailto links.

```typescript
// Text → Email
"user@example.com" → "user@example.com"
"invalid email" → "invalid email" (warning)

// URL → Email
"mailto:user@example.com" → "user@example.com"
```

---

### 9. TO PHONE
**Philosophy:** Extract digits, validate minimum length.

```typescript
// Text → Phone
"(123) 456-7890" → "1234567890"
"+1-123-456-7890" → "11234567890"
"123" → "123" (warning: may be incomplete)

// Number → Phone
1234567890 → "1234567890"
```

---

## 🚫 Protected Conversions

### Auto-Generated Properties (Cannot Convert FROM)
- `created_time`
- `created_by`
- `last_edited_time`
- `last_edited_by`
- `unique_id`

These properties are system-managed and cannot be used as source for conversion.

### Complex Properties (Require Manual Configuration)
- `formula` - formula logic needs reconfiguration
- `rollup` - aggregation rules need setup
- `relation` - database links need specification
- `button` - action configuration required

---

## 📈 Transformation Statistics

After type change, system returns:

```typescript
{
  success: true,
  transformStats: {
    total: 150,        // Total records processed
    success: 145,      // Successfully transformed
    failed: 5,         // Failed transformations
    withWarnings: 12   // Success but with warnings
  },
  generatedOptions: [  // Auto-generated options (for select types)
    {id: "option-0", label: "Red", color: "gray"},
    {id: "option-1", label: "Blue", color: "gray"}
  ]
}
```

---

## 🎨 Examples by Use Case

### Use Case 1: Tags from Text
**Scenario:** Convert comma-separated tags to multi-select

```typescript
// Before: Text field
"React, TypeScript, Next.js, Convex"

// After: Multi_Select field
value: ["option-0", "option-1", "option-2", "option-3"]
options: [
  {id: "option-0", label: "React", color: "gray"},
  {id: "option-1", label: "TypeScript", color: "gray"},
  {id: "option-2", label: "Next.js", color: "gray"},
  {id: "option-3", label: "Convex", color: "gray"}
]
```

### Use Case 2: Price Extraction
**Scenario:** Extract numbers from price text

```typescript
// Before: Text field
"Price: $1,234.56 USD"

// After: Number field
1234.56
```

### Use Case 3: Boolean Status
**Scenario:** Convert status text to checkbox

```typescript
// Before: Text field
"Completed", "Yes", "Done", "Pending", "No"

// After: Checkbox field
true, true, true, false, false
```

### Use Case 4: Status Categories
**Scenario:** Create status options from text

```typescript
// Before: Text field
"In Progress"

// After: Status field (auto-detected)
value: "in progress"
options: [
  {id: "todo", label: "To Do", color: "gray"},
  {id: "in progress", label: "In Progress", color: "blue"},
  {id: "done", label: "Done", color: "green"}
]
```

---

## 🔧 API Usage

### Frontend Usage

```typescript
import { transformPropertyValue } from '@/frontend/features/database/lib/type-transformations';

// Transform single value
const result = transformPropertyValue({
  value: "Red, Blue, Green",
  fromType: 'rich_text',
  toType: 'multi_select',
  currentOptions: []
});

console.log(result);
// {
//   value: ["option-0", "option-1", "option-2"],
//   success: true,
//   newOptions: [...]
// }
```

### Batch Transformation

```typescript
import { transformRecords } from '@/frontend/features/database/lib/type-transformation-utils';

const result = transformRecords({
  records: rows,
  fieldId: 'field_xyz',
  fromType: 'rich_text',
  toType: 'select',
  currentOptions: []
});

console.log(result.transformed.length); // Successfully transformed
console.log(result.warnings); // Warnings
console.log(result.newOptions); // Generated options
```

### Preview Transformation

```typescript
import { previewTransformation } from '@/frontend/features/database/lib/type-transformation-utils';

const preview = previewTransformation({
  records: rows,
  fieldId: 'field_xyz',
  fromType: 'rich_text',
  toType: 'number'
});

console.log(preview.summary);
// {
//   total: 100,
//   willSucceed: 85,
//   willFail: 15,
//   withWarnings: 20
// }
```

### Backend (Convex) Usage

```typescript
// Automatic in changeFieldType mutation
await ctx.runMutation(api.database.changeFieldType, {
  fieldId: "field_xyz",
  newType: "number",
  transformData: true // default
});

// Returns transformation statistics
```

---

## ⚠️ Warnings & Best Practices

### Data Loss Warnings

System shows warnings when:
1. **Lossy conversions** - e.g., Multi_Select → Select (uses first value)
2. **Failed parsing** - e.g., Text → Number with no numbers found
3. **Format issues** - e.g., Text → Email with invalid format
4. **Reference loss** - e.g., People → Text (loses user references)

### Best Practices

1. **Preview first** - Use `previewTransformation()` to see results
2. **Check warnings** - Review transformation warnings before applying
3. **Test with sample** - Test on small dataset first
4. **Backup data** - Export data before major type changes
5. **Understand trade-offs** - Some conversions are lossy by nature

### Safe Conversions (No Data Loss)

- Text ↔ Rich_Text ↔ Title (interchangeable)
- Number → Text (always safe)
- Checkbox → Text/Select (always safe)
- Date → Text (always safe)
- Select → Multi_Select (always safe)
- URL → Text (always safe)
- Email → Text (always safe)
- Phone → Text (always safe)

---

## 📁 File Structure

```
frontend/features/database/
├── lib/
│   ├── type-transformations.ts           ← Core transformation logic
│   └── type-transformation-utils.ts      ← Batch utilities

convex/features/database/
├── transformations.ts                     ← Server-side transformations
└── changeType.ts                          ← Mutation with transformation
```

---

## 🎯 Future Enhancements

- [ ] Formula type conversion (with formula migration)
- [ ] Rollup type conversion (with aggregation setup)
- [ ] Relation type conversion (with database linking)
- [ ] Custom transformation rules
- [ ] Transformation history/undo
- [ ] Bulk field type changes
- [ ] Smart type suggestions based on content
- [ ] ML-based type detection

---

**Last Updated:** November 9, 2025  
**Status:** ✅ Production Ready  
**Coverage:** 23 property types, 200+ transformation rules
