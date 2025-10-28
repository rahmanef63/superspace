# Component System

## Overview

The component system wraps shadcn/ui components with metadata for the shared system.

## Creating a Component Wrapper

### 1. Basic Structure

```typescript
import { createComponent, textProp, selectProp } from "@/frontend/shared/components/utils"
import { MyComponent } from "@/components/ui/my-component"

export const MyComponentWrapper = createComponent({
  id: "my-component",
  name: "MyComponent",
  displayName: "My Component",
  description: "Description of my component",
  category: "other",

  component: MyComponent,

  defaults: {
    variant: "default",
    text: "Hello",
  },

  props: {
    variant: selectProp("Variant", ["default", "primary"]),
    text: textProp("Text", "Hello"),
  },

  icon: "Component",
  tags: ["custom", "component"],

  metadata: {
    version: "1.0.0",
    category: "other",
  },
})
```

### 2. Prop Definitions

Available prop types:

```typescript
import {
  textProp,
  numberProp,
  booleanProp,
  selectProp,
  multiSelectProp,
  colorProp,
  imageProp,
  iconProp,
  sliderProp,
  childrenProp,
} from "@/frontend/shared/components/utils"

// Text
textProp("Label", "default value")

// Number
numberProp("Size", 16, { min: 8, max: 72, step: 1 })

// Boolean
booleanProp("Enabled", true)

// Select
selectProp("Variant", ["default", "primary", "secondary"])

// Multi-select
multiSelectProp("Tags", ["tag1", "tag2", "tag3"])

// Color
colorProp("Color", "#000000")

// Image
imageProp("Image URL", "https://example.com/image.jpg")

// Slider
sliderProp("Opacity", 100, 0, 100, 1)

// Children
childrenProp("Content")
```

### 3. Prop Groups

For common prop patterns:

```typescript
import {
  layoutProps,
  sizeProps,
  spacingProps,
} from "@/frontend/shared/components/utils"

// Layout props: display, flexDirection, justifyContent, alignItems, gap
const layout = layoutProps()

// Size props: width, height, minWidth, minHeight, maxWidth, maxHeight
const size = sizeProps()

// Spacing props: padding, margin (all directions)
const spacing = spacingProps()

// Use in component
export const MyWrapper = createComponent({
  // ...
  props: {
    ...layoutProps(),
    ...sizeProps(),
    customProp: textProp("Custom", "value"),
  },
})
```

## Component Categories

- `layout` - Container, Flex, Grid
- `typography` - Text, Heading, Paragraph
- `forms` - Input, Select, Checkbox
- `buttons` - Button, IconButton
- `data-display` - Table, Card, Badge
- `feedback` - Alert, Toast, Progress
- `overlay` - Modal, Popover, Tooltip
- `navigation` - Tabs, Menu, Breadcrumb
- `media` - Image, Video, Icon
- `surfaces` - Card, Paper, Accordion
- `other` - Custom components

## Registration

### Manual Registration

```typescript
// In frontend/shared/components/registry.ts
import MyComponentWrapper from "./MyComponent/registry"

export const componentRegistry = new Map([
  // ... existing
  [MyComponentWrapper.id, MyComponentWrapper],
])
```

### Auto-registration (Future)

```typescript
// Will auto-discover from folder structure
// No manual registration needed
```

## Usage

### Get Component

```typescript
import { getComponentWrapper } from "@/frontend/shared/components"

const button = getComponentWrapper("button")
console.log(button.defaults) // { variant: "default", ... }
```

### Create Node

```typescript
const node = {
  id: "button-1",
  type: "component",
  name: "Button",
  component: "button",
  props: { text: "Click me", variant: "primary" },
}
```

### Render Component

```typescript
const button = getComponentWrapper("button")

// Get React component
const ButtonComponent = button.component

// Render
<ButtonComponent {...props} />
```

### Convert to JSON

```typescript
const button = getComponentWrapper("button")

const props = { text: "Click me", variant: "primary" }
const json = button.toJSON(props)

console.log(json)
// { type: "component", component: "button", props: { text: "Click me", variant: "primary" } }
```

### Convert to TypeScript

```typescript
const button = getComponentWrapper("button")

const props = { text: "Click me", variant: "primary" }
const tsx = button.toTypeScript(props)

console.log(tsx)
// <Button text="Click me" variant="primary" />
```

### Validate Props

```typescript
const button = getComponentWrapper("button")

try {
  const validated = button.validate(props)
  console.log("Props valid:", validated)
} catch (error) {
  console.error("Validation error:", error)
}
```

## Examples

See [examples/custom-component.md](../examples/custom-component.md) for complete examples.

## Best Practices

1. **Keep defaults simple** - Use common values
2. **Group related props** - Use prop groups
3. **Add descriptions** - Help users understand props
4. **Use enums for select** - Provide clear options
5. **Validate thoroughly** - Prevent invalid states
6. **Add tags** - Improve searchability
7. **Include preview** - Add preview image if possible

## Next Steps

- [Registry System](./03-registry-system.md)
- [Creating Elements](./08-creating-custom-components.md)
- [Export/Import](./05-export-import.md)
