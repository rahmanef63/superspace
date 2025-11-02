# Mock Data Implementation Summary

> **Implementasi mock data lengkap untuk feature Calls dengan best practices**

**Date:** November 2, 2025
**Status:** ✅ Complete

---

## Summary

Mock data untuk feature **calls** telah berhasil dibuat dengan struktur yang lengkap dan mengikuti best practices. Mock data ini siap digunakan untuk UI development, testing, dan preview sebelum data asli dari database tersedia.

---

## ✅ What Was Done

### 1. Enhanced mockData.ts

**File:** `frontend/features/calls/mockData.ts`

#### Features Added:
- ✅ **12 mock call entries** dengan variasi lengkap
- ✅ **Clear documentation header** dengan penjelasan purpose
- ✅ **Placeholder names** yang jelas (John Doe, Jane Smith, Fulan, etc.)
- ✅ **Realistic phone numbers** dengan format +1 555-xxxx (dummy)
- ✅ **Varied timestamps** (2 minutes ago, yesterday, 3 days ago, 1 week ago)
- ✅ **Different states** (completed, missed, incoming, outgoing)
- ✅ **Both voice and video calls**
- ✅ **Complete call history** untuk setiap contact
- ✅ **Helper functions** (isMockData, getMockDataDisclaimer, getCallDetail)

#### Data Structure:
```typescript
const CALL_DATA: CallDetail[] = [
  {
    id: "mock-call-1",              // Prefixed with "mock-"
    name: "John Doe",                // Clear placeholder name
    phoneNumber: "+1 555-0100",      // Dummy phone format
    lastActivity: "2 minutes ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "5:23",
    history: [/* detailed history */]
  },
  // ... 11 more entries
]
```

### 2. UI Disclaimer Integration

**File:** `frontend/features/calls/CallDetailView.tsx`

Added visual disclaimer when viewing mock data:

```tsx
import { isMockData, getMockDataDisclaimer } from "./mockData";

{isMockData() && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>
      {getMockDataDisclaimer()}
    </AlertDescription>
  </Alert>
)}
```

**Message shown:**
> "This is sample data for preview purposes only. Real call history will appear here once connected."

### 3. Comprehensive Documentation

**File:** `docs/MOCKDATA_GUIDE.md`

Created complete guide covering:
- ✅ Overview & principles
- ✅ When to use mock data
- ✅ Naming conventions
- ✅ File structure template
- ✅ Implementation patterns
- ✅ Best practices
- ✅ Examples for multiple features
- ✅ Migration guide to real data

---

## 📊 Mock Data Details

### Quantity & Coverage

- **12 call entries** total
- **Mix of types:**
  - Voice calls: 7 entries
  - Video calls: 5 entries
  - Incoming: 5 entries
  - Outgoing: 7 entries
  - Completed: 9 entries
  - Missed: 3 entries

### Timestamp Distribution

- Recent (< 1 hour): 3 entries
- Today: 2 entries
- Yesterday: 2 entries
- Last week: 3 entries
- Older: 2 entries

### Name Diversity

**Used placeholder names:**
1. John Doe
2. Jane Smith
3. Fulan bin Fulan (Arabic variant)
4. Someone Important
5. Test Group Chat
6. Bob Example
7. Alice Placeholder
8. Sample Contact
9. Demo User
10. Placeholder Person
11. Test Account
12. Example Group

### Call History Depth

Each entry includes:
- **Today's calls** (2-3 entries per contact)
- **Yesterday's calls** (1-2 entries)
- **Historical calls** (older dates with varying patterns)
- **Duration data** for completed calls
- **Status indicators** for all calls

---

## 🎯 Mock Data Pattern

### File Structure

```
frontend/features/calls/
├── mockData.ts          ← Mock data file
├── CallsView.tsx        ← Uses mock data
├── CallListView.tsx     ← Displays mock list
└── CallDetailView.tsx   ← Shows mock details + disclaimer
```

### Standard Pattern

```typescript
// 1. Documentation header
/**
 * Mock Data for {Feature} Feature
 * Names like "John Doe" indicate this is not real data.
 */

// 2. Type definitions
export interface {Entity} { ... }

// 3. Mock data array
const MOCK_DATA: {Entity}[] = [
  { id: "mock-{entity}-1", name: "John Doe", ... },
  // ... 10-15 entries
]

// 4. Exports
export const {ENTITY}_LIST = MOCK_DATA;

// 5. Helper functions
export function get{Entity}ById(id?: string) { ... }
export function isMockData(): boolean { return true; }
export function getMockDataDisclaimer(): string { ... }
```

---

## 🔑 Key Features

### 1. Clear Indicators

✅ **IDs prefixed with "mock-"**
```typescript
id: "mock-call-1"
id: "mock-call-2"
```

✅ **Placeholder names**
```typescript
name: "John Doe"
name: "Jane Smith"
name: "Fulan bin Fulan"
```

✅ **Dummy phone numbers**
```typescript
phoneNumber: "+1 555-0100"  // 555 = dummy prefix
phoneNumber: "+62 811-9999-8888"  // Obviously fake
```

### 2. Helper Functions

```typescript
// Check if using mock data
export function isMockData(): boolean {
  return true;
}

// Get disclaimer message
export function getMockDataDisclaimer(): string {
  return "This is sample data for preview purposes only...";
}

// Get specific call
export function getCallDetail(id?: string): CallDetail | undefined {
  if (!id) return undefined;
  return CALL_DETAILS.find((call) => call.id === id);
}
```

### 3. UI Integration

**Disclaimer Alert Component:**
```tsx
{isMockData() && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>{getMockDataDisclaimer()}</AlertDescription>
  </Alert>
)}
```

Shows to users that they're viewing placeholder data.

---

## 📚 Documentation Created

### 1. MOCKDATA_GUIDE.md

Comprehensive guide with:
- Overview and principles
- When to use mock data
- Naming conventions (people, content, IDs, phones)
- File structure template
- Implementation patterns
- Best practices with do's and don'ts
- 3 complete examples (calls, documents, members)
- Migration guide to real data
- Checklist for mock data compliance

### 2. Inline Documentation

Every mock data file includes:
```typescript
/**
 * Mock Data for {Feature} Feature
 * 
 * This file contains mock/placeholder data for the {feature} feature.
 * All data here is clearly fake and used for:
 * 1. UI development and testing
 * 2. Placeholder when real data is unavailable
 * 3. Preview in menu stores and demos
 * 
 * Names like "John Doe", "Jane Smith", "Fulan" indicate this is not real data.
 * Content uses "Lorem ipsum" or "Blah blah" style placeholders.
 */
```

---

## 🚀 Benefits

### For Development

1. **No Backend Dependency**
   - Develop UI independently
   - Test without database
   - Work offline

2. **Comprehensive Testing**
   - Test all states (completed, missed, etc.)
   - Test edge cases (long names, special chars)
   - Test various timestamps

3. **Rapid Prototyping**
   - Quick UI iteration
   - Demo to stakeholders
   - Preview in menu stores

### For Users

1. **Clear Communication**
   - Disclaimer shows it's sample data
   - Placeholder names prevent confusion
   - Obvious it's not real data

2. **Realistic Preview**
   - UI looks complete
   - Interactions work
   - Layout is accurate

### For Maintenance

1. **Easy to Replace**
   - Consistent structure
   - Same interface as real data
   - Simple swap when ready

2. **Well Documented**
   - Purpose is clear
   - Structure is documented
   - Examples provided

---

## 📋 Checklist Compliance

✅ File named `mockData.ts` in feature folder  
✅ Clear documentation header  
✅ Types defined with proper interfaces  
✅ 12 mock items with variety  
✅ Names use "John Doe", "Jane Smith", "Fulan" pattern  
✅ IDs prefixed with "mock-"  
✅ Phone numbers use +1 555-xxxx format  
✅ Content uses clear placeholder text  
✅ Export helper functions (isMockData, getMockDataDisclaimer)  
✅ Export data in usable formats  
✅ Edge cases covered (various states, timestamps)  
✅ Different states included (completed, missed, incoming, outgoing)  
✅ UI shows disclaimer when using mock data  

**Score:** 13/13 ✅

---

## 🔄 Migration Path

When real data becomes available:

### Step 1: Keep Mock as Fallback
```typescript
const realData = useQuery(api.calls.list);
const calls = realData ?? CALL_SUMMARIES; // Fallback to mock
```

### Step 2: Update isMockData
```typescript
export function isMockData(): boolean {
  return !realData || realData.length === 0;
}
```

### Step 3: Conditional Disclaimer
```tsx
{isMockData() && (
  <Alert>{getMockDataDisclaimer()}</Alert>
)}
```

### Step 4: Full Migration
```typescript
// Remove mock import when ready
// import { CALL_SUMMARIES } from "./mockData";
const calls = useQuery(api.calls.list) ?? [];
```

---

## 📖 Usage Examples

### In List View
```typescript
import { CALL_SUMMARIES } from "./mockData";

export function CallListView() {
  const calls = CALL_SUMMARIES;
  
  return <SecondaryList items={transformToItems(calls)} />;
}
```

### In Detail View
```typescript
import { getCallDetail, isMockData, getMockDataDisclaimer } from "./mockData";

export function CallDetailView({ callId }: Props) {
  const call = getCallDetail(callId);
  
  return (
    <>
      {isMockData() && <Alert>{getMockDataDisclaimer()}</Alert>}
      <CallDetails call={call} />
    </>
  );
}
```

### In Preview/Demo
```typescript
import { CALL_SUMMARIES } from "@/frontend/features/calls/mockData";

export function MenuStorePreview() {
  return <CallsPreview calls={CALL_SUMMARIES.slice(0, 5)} />;
}
```

---

## 🎯 Next Steps

### Apply Pattern to Other Features

This mock data pattern can now be applied to:

1. **Status** feature - User status list
2. **Members** feature - Team member list
3. **Documents** feature - Document list
4. **Projects** feature - Project list
5. **Tasks** feature - Task list
6. **Wiki** feature - Wiki page list
7. **Calendar** feature - Event list
8. **Notifications** feature - Notification list

### Template for New Features

Use `docs/MOCKDATA_GUIDE.md` as template for creating mock data in new features.

---

## 📝 Files Created/Modified

### Created:
1. ✅ `docs/MOCKDATA_GUIDE.md` - Comprehensive mock data guide
2. ✅ `CALLS_MOCKDATA_SUMMARY.md` - This summary

### Modified:
1. ✅ `frontend/features/calls/mockData.ts` - Enhanced with 12 entries + helpers
2. ✅ `frontend/features/calls/CallDetailView.tsx` - Added disclaimer UI

---

## ✅ Success Criteria Met

✅ Mock data clearly identifiable (placeholder names, mock- prefix)  
✅ Sufficient quantity (12 entries)  
✅ Variety of states and types  
✅ Helper functions provided  
✅ UI shows disclaimer  
✅ Well documented  
✅ Easy to maintain  
✅ Ready for migration  
✅ Reusable pattern established  

---

**Status:** ✅ Mock data implementation complete and ready for use!

**Reference Files:**
- Implementation: `frontend/features/calls/mockData.ts`
- Guide: `docs/MOCKDATA_GUIDE.md`
- UI Integration: `frontend/features/calls/CallDetailView.tsx`
