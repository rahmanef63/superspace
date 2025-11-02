# Mock Data Guidelines

> **Best practices untuk membuat dan menggunakan mock/placeholder data di SuperSpace**

**Last Updated:** November 2, 2025

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [When to Use Mock Data](#when-to-use-mock-data)
3. [Naming Conventions](#naming-conventions)
4. [File Structure](#file-structure)
5. [Implementation Pattern](#implementation-pattern)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

---

## Overview

Mock data adalah data placeholder yang digunakan untuk:
- **UI Development** - Develop UI sebelum backend ready
- **Testing** - Test component behavior dengan data berbagai format
- **Preview** - Show feature preview di menu stores dan demos
- **Fallback** - Provide fallback ketika real data tidak tersedia

### ⚠️ Important Principles

1. **Mock data harus jelas bukan data asli**
   - Gunakan nama seperti "John Doe", "Jane Smith", "Fulan", "Someone"
   - Gunakan konten seperti "Lorem ipsum", "Blah blah", "Sample text"
   - Gunakan nomor telepon format dummy: +1 555-xxxx

2. **Mock data harus representative**
   - Cover semua edge cases (empty, long text, special chars)
   - Include various states (active, inactive, pending, etc.)
   - Test different data types and formats

3. **Mock data harus maintainable**
   - Consistent structure across features
   - Well-documented types
   - Easy to replace with real data

---

## When to Use Mock Data

### ✅ Use Mock Data When:

- Backend API belum ready
- Developing UI components
- Testing edge cases
- Preview di menu stores
- Onboarding/demo flows
- Offline development

### ❌ Don't Use Mock Data When:

- Real data available dari database
- Production environment
- User-generated content
- Sensitive data scenarios
- Performance testing

---

## Naming Conventions

### File Names
```
mockData.ts    // Standard mock data file
mockUsers.ts   // Specific entity mock data (optional)
fixtures.json  // JSON fixtures (optional)
```

### Placeholder Names

#### People Names
```typescript
// Generic placeholders
"John Doe"
"Jane Smith"
"Bob Example"
"Alice Placeholder"

// International variants
"Fulan bin Fulan"  // Arabic
"Someone Important"
"Demo User"
"Test Account"

// Groups/Organizations
"Sample Company"
"Test Group"
"Example Team"
"Demo Organization"
```

#### Content Placeholders
```typescript
// Short text
"Blah blah blah"
"Lorem ipsum"
"Sample text here"

// Descriptions
"Lorem ipsum dolor sit amet, consectetur adipiscing elit."
"This is a sample description for demonstration purposes."

// URLs/Emails
"johndoe@example.com"
"placeholder@sample.org"
"https://example.com"
```

#### Phone Numbers
```typescript
// US format (555 = dummy)
"+1 555-0100"
"+1 555-0101"

// International format
"+62 811-9999-8888"  // Indonesia
"+44 20 7946 0958"   // UK (fake)
```

#### IDs
```typescript
// Prefix with "mock-"
"mock-user-1"
"mock-call-123"
"mock-doc-abc"
```

---

## File Structure

### Standard Mock Data File

```typescript
"use client";

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

// ===== Types =====
export interface {Entity} {
  id: string;
  name: string;
  // ... other fields
}

// ===== Mock Data =====
const MOCK_{ENTITIES}: {Entity}[] = [
  {
    id: "mock-{entity}-1",
    name: "John Doe",
    // ... mock values
  },
  // ... more items
];

// ===== Exports =====
export const {ENTITY}_LIST = MOCK_{ENTITIES};

export function get{Entity}ById(id?: string): {Entity} | undefined {
  if (!id) return undefined;
  return MOCK_{ENTITIES}.find((item) => item.id === id);
}

// ===== Helpers =====
export function isMockData(): boolean {
  return true;
}

export function getMockDataDisclaimer(): string {
  return "This is sample data for preview purposes only. Real data will appear here once connected.";
}
```

---

## Implementation Pattern

### 1. Define Types

```typescript
export interface CallDetail {
  id: string;
  name: string;
  phoneNumber: string;
  avatar?: string;
  lastActivity: string;
  direction: "incoming" | "outgoing";
  medium: "voice" | "video";
  status: "completed" | "missed";
  duration?: string;
  history: CallHistoryDay[];
}
```

### 2. Create Mock Data

```typescript
const CALL_DATA: CallDetail[] = [
  {
    id: "mock-call-1",
    name: "John Doe",
    phoneNumber: "+1 555-0100",
    avatar: undefined,
    lastActivity: "2 minutes ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "5:23",
    history: [
      {
        date: "Today",
        entries: [
          { 
            time: "2:30 PM", 
            direction: "outgoing", 
            medium: "voice", 
            duration: "5:23", 
            status: "completed" 
          },
        ],
      },
    ],
  },
  // ... 10-15 more entries for variety
];
```

### 3. Export Data & Helpers

```typescript
export const CALL_DETAILS: CallDetail[] = CALL_DATA;

export const CALL_SUMMARIES: CallSummary[] = CALL_DATA.map(
  ({ id, name, avatar, lastActivity, direction, medium, status, duration }) => ({
    id, name, avatar, lastActivity, direction, medium, status, duration,
  }),
);

export function getCallDetail(id?: string): CallDetail | undefined {
  if (!id) return undefined;
  return CALL_DETAILS.find((call) => call.id === id);
}

export function isMockData(): boolean {
  return true;
}

export function getMockDataDisclaimer(): string {
  return "This is sample data for preview purposes only. Real call history will appear here once connected.";
}
```

### 4. Use in Components

```typescript
import { CALL_SUMMARIES, isMockData, getMockDataDisclaimer } from "./mockData";

export function CallsView() {
  const calls = CALL_SUMMARIES; // Replace with real query later
  
  return (
    <div>
      {isMockData() && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>{getMockDataDisclaimer()}</AlertDescription>
        </Alert>
      )}
      
      <CallList calls={calls} />
    </div>
  );
}
```

---

## Best Practices

### 1. Quantity & Variety

✅ **DO:**
- Include 10-15 items for realistic scrolling
- Mix different states (active, inactive, pending)
- Include edge cases (very long names, empty fields, special characters)
- Vary timestamps (recent, yesterday, last week, old)

❌ **DON'T:**
- Only 2-3 items (unrealistic)
- All same state
- All same length/format
- Only recent timestamps

### 2. Realistic Structure

✅ **DO:**
```typescript
{
  id: "mock-user-1",
  name: "John Doe",
  email: "johndoe@example.com",
  bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  createdAt: "2 days ago",
  status: "active"
}
```

❌ **DON'T:**
```typescript
{
  id: "1",  // Too simple
  name: "User",  // Too generic
  email: "test@test.com",  // Too obvious
  bio: "test",  // Too short
  createdAt: "now",  // Unrealistic
  status: "status"  // Meaningless
}
```

### 3. Clear Indicators

✅ **DO:**
- Names: "John Doe", "Jane Smith", "Fulan"
- IDs: "mock-{entity}-{number}"
- Content: "Lorem ipsum...", "Sample text..."
- Show disclaimer in UI

❌ **DON'T:**
- Names: "User1", "User2" (looks real)
- IDs: "1", "2" (looks real)
- Content: realistic text (confusing)
- No indication it's mock data

### 4. Documentation

✅ **DO:**
```typescript
/**
 * Mock Data for Calls Feature
 * 
 * This file contains mock/placeholder data.
 * Names like "John Doe" indicate this is not real data.
 */
```

❌ **DON'T:**
```typescript
// some data
const data = [...]
```

### 5. Helper Functions

✅ **DO:**
```typescript
export function isMockData(): boolean {
  return true;
}

export function getMockDataDisclaimer(): string {
  return "This is sample data...";
}

export function getItemById(id: string) { ... }
```

❌ **DON'T:**
```typescript
// No helpers, just raw export
export const DATA = [...]
```

---

## Examples

### Example 1: Calls Feature

**File:** `frontend/features/calls/mockData.ts`

```typescript
"use client";

/**
 * Mock Data for Calls Feature
 */

export interface CallDetail {
  id: string;
  name: string;
  phoneNumber: string;
  lastActivity: string;
  direction: "incoming" | "outgoing";
  medium: "voice" | "video";
  status: "completed" | "missed";
  duration?: string;
}

const CALL_DATA: CallDetail[] = [
  {
    id: "mock-call-1",
    name: "John Doe",
    phoneNumber: "+1 555-0100",
    lastActivity: "2 minutes ago",
    direction: "outgoing",
    medium: "voice",
    status: "completed",
    duration: "5:23",
  },
  {
    id: "mock-call-2",
    name: "Jane Smith",
    phoneNumber: "+1 555-0101",
    lastActivity: "15 minutes ago",
    direction: "incoming",
    medium: "video",
    status: "missed",
  },
  // ... 10 more entries
];

export const CALL_SUMMARIES = CALL_DATA;

export function getCallDetail(id?: string) {
  return CALL_DATA.find(call => call.id === id);
}

export function isMockData() {
  return true;
}

export function getMockDataDisclaimer() {
  return "This is sample data for preview purposes only.";
}
```

### Example 2: Documents Feature

**File:** `frontend/features/documents/mockData.ts`

```typescript
"use client";

/**
 * Mock Data for Documents Feature
 */

export interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "sheet" | "image";
  size: string;
  updatedAt: string;
  owner: string;
}

const MOCK_DOCUMENTS: Document[] = [
  {
    id: "mock-doc-1",
    name: "Sample Document.pdf",
    type: "pdf",
    size: "2.5 MB",
    updatedAt: "5 minutes ago",
    owner: "John Doe",
  },
  {
    id: "mock-doc-2",
    name: "Example Spreadsheet.xlsx",
    type: "sheet",
    size: "1.2 MB",
    updatedAt: "1 hour ago",
    owner: "Jane Smith",
  },
  // ... more items
];

export const DOCUMENT_LIST = MOCK_DOCUMENTS;

export function getDocumentById(id?: string) {
  return MOCK_DOCUMENTS.find(doc => doc.id === id);
}

export function isMockData() {
  return true;
}

export function getMockDataDisclaimer() {
  return "These are sample documents for preview purposes only.";
}
```

### Example 3: Members Feature

**File:** `frontend/features/members/mockData.ts`

```typescript
"use client";

/**
 * Mock Data for Members Feature
 */

export interface Member {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member" | "viewer";
  status: "active" | "inactive" | "pending";
  joinedAt: string;
  avatar?: string;
}

const MOCK_MEMBERS: Member[] = [
  {
    id: "mock-member-1",
    name: "John Doe",
    email: "johndoe@example.com",
    role: "admin",
    status: "active",
    joinedAt: "3 months ago",
  },
  {
    id: "mock-member-2",
    name: "Jane Smith",
    email: "janesmith@example.com",
    role: "member",
    status: "active",
    joinedAt: "2 months ago",
  },
  {
    id: "mock-member-3",
    name: "Fulan bin Fulan",
    email: "fulan@example.com",
    role: "viewer",
    status: "pending",
    joinedAt: "1 week ago",
  },
  // ... more entries
];

export const MEMBER_LIST = MOCK_MEMBERS;

export function getMemberById(id?: string) {
  return MOCK_MEMBERS.find(member => member.id === id);
}

export function getMembersByRole(role: Member["role"]) {
  return MOCK_MEMBERS.filter(member => member.role === role);
}

export function getActiveMembersCount() {
  return MOCK_MEMBERS.filter(m => m.status === "active").length;
}

export function isMockData() {
  return true;
}

export function getMockDataDisclaimer() {
  return "These are sample members for preview purposes only.";
}
```

---

## Migration to Real Data

When replacing mock data with real data:

### 1. Keep Same Structure

```typescript
// Before (mock)
import { CALL_SUMMARIES } from "./mockData";
const calls = CALL_SUMMARIES;

// After (real)
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
const calls = useQuery(api.calls.list) ?? [];
```

### 2. Keep Helper Functions

```typescript
// Update helper to check real data
export function isMockData(): boolean {
  // Check if using real database
  return !convex.isConnected();
}
```

### 3. Fallback to Mock

```typescript
const realData = useQuery(api.calls.list);
const calls = realData ?? CALL_SUMMARIES; // Fallback to mock

// Show disclaimer if using mock
{(!realData || isMockData()) && (
  <Alert>
    <Info className="h-4 w-4" />
    <AlertDescription>{getMockDataDisclaimer()}</AlertDescription>
  </Alert>
)}
```

---

## Summary

### ✅ Checklist for Mock Data

- [ ] File named `mockData.ts` in feature folder
- [ ] Clear documentation header
- [ ] Types defined with proper interfaces
- [ ] 10-15 mock items with variety
- [ ] Names use "John Doe", "Jane Smith", "Fulan" pattern
- [ ] IDs prefixed with "mock-"
- [ ] Phone numbers use +1 555-xxxx format
- [ ] Content uses "Lorem ipsum" or "Sample" text
- [ ] Export helper functions (isMockData, getMockDataDisclaimer)
- [ ] Export data in usable formats
- [ ] Edge cases covered (long names, special chars, etc.)
- [ ] Different states included (active, pending, etc.)
- [ ] UI shows disclaimer when using mock data

---

**Reference Implementation:** `frontend/features/calls/mockData.ts`
