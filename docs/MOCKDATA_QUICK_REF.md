# Mock Data Quick Reference

> **Cheatsheet untuk membuat mock data di SuperSpace features**

---

## 📁 File Template

```typescript
"use client";

/**
 * Mock Data for {Feature} Feature
 * 
 * Names like "John Doe", "Jane Smith", "Fulan" indicate this is not real data.
 */

// Types
export interface {Entity} {
  id: string;
  name: string;
  // ... fields
}

// Mock Data
const MOCK_{ENTITIES}: {Entity}[] = [
  { id: "mock-{entity}-1", name: "John Doe", /* ... */ },
  { id: "mock-{entity}-2", name: "Jane Smith", /* ... */ },
  // ... 10-15 items
];

// Exports
export const {ENTITY}_LIST = MOCK_{ENTITIES};

export function get{Entity}ById(id?: string) {
  return MOCK_{ENTITIES}.find(item => item.id === id);
}

export function isMockData() {
  return true;
}

export function getMockDataDisclaimer() {
  return "This is sample data for preview purposes only. Real data will appear here once connected.";
}
```

---

## 🏷️ Naming Conventions

### People Names
```typescript
"John Doe"
"Jane Smith"
"Bob Example"
"Alice Placeholder"
"Fulan bin Fulan"
"Someone Important"
"Demo User"
"Test Account"
```

### IDs
```typescript
"mock-user-1"
"mock-call-123"
"mock-doc-abc"
"mock-{entity}-{number}"
```

### Phone Numbers
```typescript
"+1 555-0100"  // US dummy format
"+1 555-0101"
"+62 811-9999-8888"  // International
```

### Emails
```typescript
"johndoe@example.com"
"placeholder@sample.org"
"{name}@example.com"
```

### Content
```typescript
"Lorem ipsum dolor sit amet..."
"Sample text for demonstration"
"Blah blah blah"
"This is placeholder content"
```

---

## 🎯 Best Practices

### Quantity
- ✅ 10-15 items minimum
- ✅ Mix of different states
- ✅ Edge cases included

### Variety
- ✅ Different lengths (short/long names)
- ✅ Different timestamps (recent/old)
- ✅ Different statuses (active/inactive/pending)
- ✅ Special characters where applicable

### Documentation
- ✅ Header comment explaining purpose
- ✅ Clear type definitions
- ✅ Exported helper functions

---

## 🖥️ UI Integration

```tsx
import { isMockData, getMockDataDisclaimer } from "./mockData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

// Show disclaimer
{isMockData() && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      {getMockDataDisclaimer()}
    </AlertDescription>
  </Alert>
)}
```

---

## 🔄 Migration Pattern

```typescript
// Step 1: Use mock
import { ENTITY_LIST } from "./mockData";
const items = ENTITY_LIST;

// Step 2: Add real data with fallback
const realData = useQuery(api.entity.list);
const items = realData ?? ENTITY_LIST;

// Step 3: Full migration
const items = useQuery(api.entity.list) ?? [];
```

---

## ✅ Checklist

- [ ] File: `mockData.ts` in feature folder
- [ ] Documentation header
- [ ] Type definitions
- [ ] 10-15 mock items
- [ ] Placeholder names (John Doe, etc.)
- [ ] Mock- prefix for IDs
- [ ] Dummy phone/email formats
- [ ] Helper: `isMockData()`
- [ ] Helper: `getMockDataDisclaimer()`
- [ ] Helper: `getById()` or similar
- [ ] UI disclaimer shown
- [ ] Edge cases covered
- [ ] Various states included

---

**Full Guide:** `docs/MOCKDATA_GUIDE.md`  
**Example:** `frontend/features/calls/mockData.ts`
