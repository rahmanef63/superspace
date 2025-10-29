# Domain README Template

Use this template for each domain in `frontend/shared/`:

---

# {Domain Name} Domain

**Location**: `frontend/shared/{domain}/`
**Status**: {Active | Planning | Deprecated}
**Last Updated**: {Date}

## 🎯 Purpose

{Clear 1-2 sentence description of what this domain provides}

Example:
> The Builder domain provides all canvas/editor building functionality including visual editors, property inspectors, and template management.

## 📦 Main Exports

### Core Exports
```typescript
// List primary exports that features will use
export { MainComponent } from './main'
export { useMainHook } from './hooks'
export type { MainType } from './types'
```

### Usage Example
```typescript
// Show typical usage pattern
import { MainComponent, useMainHook } from '@/frontend/shared/{domain}'

function FeatureComponent() {
  const data = useMainHook()
  return <MainComponent data={data} />
}
```

## 🔗 Dependencies

### Internal Dependencies (other shared domains)
- **foundation**: Core utilities, types, hooks
- **ui**: Generic UI components

### External Dependencies
- **React**: UI library
- **{Other packages}**: Description

## 📊 Used By

List features that depend on this domain:

- **CMS Feature**: Uses canvas and inspector components
- **Database Feature**: Uses canvas for schema visualization
- **{Other features}**: Usage description

## 🏗️ Internal Structure

```
{domain}/
├── index.ts           # Facade exports (PUBLIC API)
├── {module1}/         # Internal module 1
│   ├── Component.tsx
│   └── hooks.ts
├── {module2}/         # Internal module 2
└── README.md         # This file
```

## ⚠️ Important Rules

### DO ✅
- Import from this domain's facade: `@/frontend/shared/{domain}`
- Keep components generic and reusable
- Document all public exports
- Follow domain boundaries

### DON'T ❌
- Import from internal paths: `@/frontend/shared/{domain}/internal/...`
- Add feature-specific logic
- Import from other domains except foundation/ui
- Create circular dependencies

## 🧪 Testing

{Describe testing approach for this domain}

Example:
> All components in this domain should have unit tests. Integration tests should verify facade exports work correctly.

Test location: `tests/shared/{domain}/`

## 📚 Additional Documentation

- [Integration Guide](../INTEGRATION_GUIDE.md)
- [Architecture Overview](../1_SYSTEM_OVERVIEW.md)
- [{Specific docs if any}]

## 🔄 Change Log

### {Version} - {Date}
- {Change description}

### {Version} - {Date}
- {Change description}

---

**Maintainers**: {Team/Person}
**Questions**: {Contact/Link}
