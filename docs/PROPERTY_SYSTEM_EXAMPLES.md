# Universal Database Property System - Usage Examples

Complete examples demonstrating how to use the Property Registry system.

---

## 🚀 Quick Start

### 1. Display Property Value (Read-Only)

```typescript
import { FieldValue } from '@/frontend/features/database/components/FieldValue';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

// V2 Property
const titleProperty: Property = {
  id: 'prop_1',
  key: 'title',
  type: 'title',
  name: 'Project Title',
  required: true,
  options: null,
};

function MyComponent() {
  const value = 'My Awesome Project';
  
  return <FieldValue field={titleProperty} value={value} />;
  // Renders: "My Awesome Project"
}
```

### 2. Edit Property Value (Interactive)

```typescript
import { EditableCell } from '@/frontend/features/database/components/views/table/components/EditableCell';

function MyEditableTable() {
  const handleCommit = async (newValue: unknown) => {
    console.log('New value:', newValue);
    // Save to database
  };
  
  return (
    <EditableCell
      field={titleProperty}
      value="My Awesome Project"
      onCommit={handleCommit}
    />
  );
}
```

---

## 📋 Property Type Examples

### Core Properties

#### 1. Title Property

```typescript
import { TitleRenderer, TitleEditor } from '@/frontend/features/database/properties/title';

const property: Property = {
  id: 'prop_title',
  key: 'title',
  type: 'title',
  name: 'Title',
  required: true,
  options: null,
};

// Display
<TitleRenderer value="My Project" property={property} readOnly={true} />

// Edit
<TitleEditor 
  value="My Project" 
  property={property}
  onChange={(newValue) => console.log(newValue)}
/>
```

#### 2. Checkbox Property

```typescript
import { CheckboxRenderer, CheckboxEditor } from '@/frontend/features/database/properties/checkbox';

const property: Property = {
  id: 'prop_complete',
  key: 'is_complete',
  type: 'checkbox',
  name: 'Completed',
  required: false,
  options: null,
};

// Display
<CheckboxRenderer value={true} property={property} readOnly={true} />

// Edit
<CheckboxEditor 
  value={false} 
  property={property}
  onChange={(checked) => console.log('Checked:', checked)}
/>
```

#### 3. Rich Text Property

```typescript
import { RichTextRenderer, RichTextEditor } from '@/frontend/features/database/properties/rich_text';

const property: Property = {
  id: 'prop_desc',
  key: 'description',
  type: 'rich_text',
  name: 'Description',
  required: false,
  options: null,
};

const markdown = `
# Project Overview
This is a **bold** statement with *emphasis*.

- Feature 1
- Feature 2
`;

// Display (shows preview)
<RichTextRenderer value={markdown} property={property} readOnly={true} />

// Edit (full textarea)
<RichTextEditor 
  value={markdown}
  property={property}
  onChange={(text) => console.log(text)}
/>
```

#### 4. Number Property

```typescript
import { NumberRenderer, NumberEditor } from '@/frontend/features/database/properties/number';

const property: Property = {
  id: 'prop_price',
  key: 'price',
  type: 'number',
  name: 'Price',
  required: false,
  options: null,
};

// Display (formatted: 1,234.56)
<NumberRenderer value={1234.56} property={property} readOnly={true} />

// Edit
<NumberEditor 
  value={1234.56}
  property={property}
  onChange={(num) => console.log('Price:', num)}
/>
```

#### 5. Select Property

```typescript
import { SelectRenderer, SelectEditor } from '@/frontend/features/database/properties/select';

const property: Property = {
  id: 'prop_priority',
  key: 'priority',
  type: 'select',
  name: 'Priority',
  required: false,
  options: {
    selectOptions: [
      { id: 'high', name: 'High', color: '#ef4444' },
      { id: 'medium', name: 'Medium', color: '#f59e0b' },
      { id: 'low', name: 'Low', color: '#10b981' },
    ],
  },
};

// Display (colored badge)
<SelectRenderer value="high" property={property} readOnly={true} />

// Edit (dropdown)
<SelectEditor 
  value="medium"
  property={property}
  onChange={(selected) => console.log('Priority:', selected)}
/>
```

#### 6. Date Property

```typescript
import { DateRenderer, DateEditor } from '@/frontend/features/database/properties/date';

const property: Property = {
  id: 'prop_due',
  key: 'due_date',
  type: 'date',
  name: 'Due Date',
  required: false,
  options: null,
};

const isoDate = '2025-12-31T23:59:59.000Z';

// Display (formatted: "Dec 31, 2025")
<DateRenderer value={isoDate} property={property} readOnly={true} />

// Edit (date picker)
<DateEditor 
  value={isoDate}
  property={property}
  onChange={(date) => console.log('Due date:', date)}
/>
```

#### 7. People Property

```typescript
import { PeopleRenderer, PeopleEditor } from '@/frontend/features/database/properties/people';

const property: Property = {
  id: 'prop_assignee',
  key: 'assignees',
  type: 'people',
  name: 'Assignees',
  required: false,
  options: null,
};

const people = [
  { name: 'John Doe', email: 'john@example.com', avatar: 'https://...' },
  { name: 'Jane Smith', email: 'jane@example.com' },
];

// Display (stacked avatars)
<PeopleRenderer value={people} property={property} readOnly={true} />

// Edit
<PeopleEditor 
  value={people}
  property={property}
  onChange={(people) => console.log('Assignees:', people)}
/>
```

---

### Extended Properties

#### 8. Status Property

```typescript
import { StatusRenderer, StatusEditor } from '@/frontend/features/database/properties/status';

const property: Property = {
  id: 'prop_status',
  key: 'status',
  type: 'status',
  name: 'Status',
  required: false,
  options: null,
};

// Display (color-coded badge)
<StatusRenderer value="In Progress" property={property} readOnly={true} />

// Edit (quick-select buttons + input)
<StatusEditor 
  value="Not Started"
  property={property}
  onChange={(status) => console.log('Status:', status)}
/>
```

#### 9. Phone Property

```typescript
import { PhoneRenderer, PhoneEditor } from '@/frontend/features/database/properties/phone';

const property: Property = {
  id: 'prop_phone',
  key: 'phone',
  type: 'phone',
  name: 'Phone',
  required: false,
  options: null,
};

// Display (tel: link)
<PhoneRenderer value="+1 (555) 123-4567" property={property} readOnly={true} />

// Edit
<PhoneEditor 
  value="+1 (555) 123-4567"
  property={property}
  onChange={(phone) => console.log('Phone:', phone)}
/>
```

#### 10. Place Property

```typescript
import { PlaceRenderer, PlaceEditor } from '@/frontend/features/database/properties/place';

const property: Property = {
  id: 'prop_location',
  key: 'location',
  type: 'place',
  name: 'Location',
  required: false,
  options: null,
};

const location = {
  address: '1600 Amphitheatre Parkway, Mountain View, CA',
  lat: 37.4224764,
  lng: -122.0842499,
};

// Display (Google Maps link)
<PlaceRenderer value={location} property={property} readOnly={true} />

// Edit (address + lat/lng inputs)
<PlaceEditor 
  value={location}
  property={property}
  onChange={(place) => console.log('Location:', place)}
/>
```

#### 11. Button Property

```typescript
import { ButtonRenderer, ButtonEditor } from '@/frontend/features/database/properties/button';

const property: Property = {
  id: 'prop_action',
  key: 'action_button',
  type: 'button',
  name: 'Action',
  required: false,
  options: {
    label: 'View Details',
  },
};

// Display (clickable button)
<ButtonRenderer 
  value="https://example.com/details" 
  property={property} 
  readOnly={true} 
/>

// Edit (URL input)
<ButtonEditor 
  value="https://example.com/details"
  property={property}
  onChange={(url) => console.log('Button URL:', url)}
/>
```

---

### Auto Properties (Read-Only)

#### 12. Unique ID Property

```typescript
import { UniqueIdRenderer, UniqueIdEditor } from '@/frontend/features/database/properties/unique_id';

const property: Property = {
  id: 'prop_id',
  key: 'unique_id',
  type: 'unique_id',
  name: 'ID',
  required: false,
  options: null,
};

// Display (code block)
<UniqueIdRenderer value="PROJ-2025-001" property={property} readOnly={true} />

// Edit (read-only message)
<UniqueIdEditor 
  value="PROJ-2025-001"
  property={property}
  onChange={() => {}} // No-op, read-only
/>
```

#### 13. Created Time Property

```typescript
import { CreatedTimeRenderer, CreatedTimeEditor } from '@/frontend/features/database/properties/created_time';

const property: Property = {
  id: 'prop_created',
  key: 'created_time',
  type: 'created_time',
  name: 'Created',
  required: false,
  options: null,
};

const timestamp = '2025-11-03T10:30:00.000Z';

// Display (relative: "2h ago")
<CreatedTimeRenderer value={timestamp} property={property} readOnly={true} />

// Edit (read-only display)
<CreatedTimeEditor 
  value={timestamp}
  property={property}
  onChange={() => {}}
/>
```

#### 14. Created By Property

```typescript
import { CreatedByRenderer, CreatedByEditor } from '@/frontend/features/database/properties/created_by';

const property: Property = {
  id: 'prop_creator',
  key: 'created_by',
  type: 'created_by',
  name: 'Created By',
  required: false,
  options: null,
};

const user = {
  id: 'user_123',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://...',
};

// Display (avatar + name)
<CreatedByRenderer value={user} property={property} readOnly={true} />

// Edit (read-only user card)
<CreatedByEditor 
  value={user}
  property={property}
  onChange={() => {}}
/>
```

---

## 🔧 Advanced Usage

### Using Property Registry Directly

```typescript
import { propertyRegistry } from '@/frontend/features/database/registry';

// Get property config
const titleConfig = propertyRegistry.get('title');

if (titleConfig) {
  console.log('Label:', titleConfig.label);
  console.log('Description:', titleConfig.description);
  console.log('Category:', titleConfig.category);
  console.log('Supports Options:', titleConfig.supportsOptions);
  console.log('Is Editable:', titleConfig.isEditable);
}

// Get all properties
const allProperties = propertyRegistry.getAll();
console.log('Total properties:', allProperties.length);

// Get by category
const coreProperties = propertyRegistry.getByCategory('core');
const autoProperties = propertyRegistry.getByCategory('auto');

// Get by tag
const textProperties = propertyRegistry.getByTag('text');
```

### Custom Validation

```typescript
import { propertyRegistry } from '@/frontend/features/database/registry';

function validatePropertyValue(type: PropertyType, value: unknown): string | null {
  const config = propertyRegistry.get(type);
  
  if (!config || !config.validate) {
    return null; // No validation
  }
  
  // Create minimal property for validation
  const property: Property = {
    id: 'temp',
    key: 'temp',
    type,
    name: 'Temp',
    required: false,
    options: null,
  };
  
  return config.validate(value, property);
}

// Usage
const error = validatePropertyValue('email', 'invalid-email');
console.log('Error:', error); // "Invalid email format"

const valid = validatePropertyValue('email', 'john@example.com');
console.log('Valid:', valid); // null (no error)
```

### Custom Formatting

```typescript
import { propertyRegistry } from '@/frontend/features/database/registry';

function formatPropertyValue(type: PropertyType, value: unknown): string {
  const config = propertyRegistry.get(type);
  
  if (!config || !config.format) {
    return String(value);
  }
  
  return config.format(value);
}

// Usage
const formatted = formatPropertyValue('number', 1234567.89);
console.log('Formatted:', formatted); // "1,234,567.89"

const dateFormatted = formatPropertyValue('date', '2025-11-03T10:30:00.000Z');
console.log('Date:', dateFormatted); // "Nov 3, 2025"
```

---

## 🎯 Real-World Example: Task Management

```typescript
import React, { useState } from 'react';
import { FieldValue } from '@/frontend/features/database/components/FieldValue';
import { EditableCell } from '@/frontend/features/database/components/views/table/components/EditableCell';
import type { Property } from '@/frontend/shared/foundation/types/universal-database';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: { name: string; email: string };
  dueDate: string;
  isComplete: boolean;
}

const properties: Record<string, Property> = {
  title: {
    id: 'prop_1',
    key: 'title',
    type: 'title',
    name: 'Task Title',
    required: true,
    options: null,
  },
  status: {
    id: 'prop_2',
    key: 'status',
    type: 'status',
    name: 'Status',
    required: false,
    options: null,
  },
  priority: {
    id: 'prop_3',
    key: 'priority',
    type: 'select',
    name: 'Priority',
    required: false,
    options: {
      selectOptions: [
        { id: 'high', name: 'High', color: '#ef4444' },
        { id: 'medium', name: 'Medium', color: '#f59e0b' },
        { id: 'low', name: 'Low', color: '#10b981' },
      ],
    },
  },
  assignee: {
    id: 'prop_4',
    key: 'assignee',
    type: 'people',
    name: 'Assignee',
    required: false,
    options: null,
  },
  dueDate: {
    id: 'prop_5',
    key: 'due_date',
    type: 'date',
    name: 'Due Date',
    required: false,
    options: null,
  },
  isComplete: {
    id: 'prop_6',
    key: 'is_complete',
    type: 'checkbox',
    name: 'Completed',
    required: false,
    options: null,
  },
};

export function TaskBoard() {
  const [task, setTask] = useState<Task>({
    id: 'task_1',
    title: 'Implement property system',
    status: 'In Progress',
    priority: 'high',
    assignee: { name: 'John Doe', email: 'john@example.com' },
    dueDate: '2025-11-30T00:00:00.000Z',
    isComplete: false,
  });

  const handleUpdate = async (key: keyof Task, value: unknown) => {
    setTask((prev) => ({ ...prev, [key]: value }));
    // Save to database
    console.log('Updated:', key, value);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Task Details</h2>
      
      {/* Read-Only View */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Read-Only View</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <FieldValue field={properties.title} value={task.title} />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <FieldValue field={properties.status} value={task.status} />
          </div>
          <div>
            <label className="text-sm font-medium">Priority</label>
            <FieldValue field={properties.priority} value={task.priority} />
          </div>
          <div>
            <label className="text-sm font-medium">Assignee</label>
            <FieldValue field={properties.assignee} value={task.assignee} />
          </div>
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <FieldValue field={properties.dueDate} value={task.dueDate} />
          </div>
          <div>
            <label className="text-sm font-medium">Completed</label>
            <FieldValue field={properties.isComplete} value={task.isComplete} />
          </div>
        </div>
      </div>

      {/* Editable View */}
      <div className="rounded-lg border p-4 space-y-2">
        <h3 className="font-semibold">Editable View</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <EditableCell
              field={properties.title}
              value={task.title}
              onCommit={(v) => handleUpdate('title', v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status</label>
            <EditableCell
              field={properties.status}
              value={task.status}
              onCommit={(v) => handleUpdate('status', v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Priority</label>
            <EditableCell
              field={properties.priority}
              value={task.priority}
              onCommit={(v) => handleUpdate('priority', v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Assignee</label>
            <EditableCell
              field={properties.assignee}
              value={task.assignee}
              onCommit={(v) => handleUpdate('assignee', v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Due Date</label>
            <EditableCell
              field={properties.dueDate}
              value={task.dueDate}
              onCommit={(v) => handleUpdate('dueDate', v)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Completed</label>
            <EditableCell
              field={properties.isComplete}
              value={task.isComplete}
              onCommit={(v) => handleUpdate('isComplete', v)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🚀 Next Steps

1. **Explore Properties:** Try all 21 property types
2. **Build Custom Views:** Use properties in your UI
3. **Add New Properties:** Follow the 4-file pattern
4. **Test Everything:** Run comprehensive tests
5. **Deploy:** Ship to production!

---

For more information, see:
- `docs/PHASE_3_SUMMARY.md` - Complete Phase 3 overview
- `docs/UNIVERSAL_DATABASE_SPEC.md` - Full specification
- `frontend/features/database/properties/` - Source code
