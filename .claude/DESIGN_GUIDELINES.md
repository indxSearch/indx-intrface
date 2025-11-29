# Design Guidelines

This document outlines the core design principles for the indx-intrface project.

## Core Principles

### 1. No Shadows or Animations

**Rule:** Do not add shadows or animations to any components.

- ❌ `box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);`
- ❌ `animation: slideIn 0.3s ease;`
- ❌ `transition: all 0.3s ease;`
- ✅ Instant state changes
- ✅ Simple, flat design

**Exceptions:** None. All components should appear and disappear instantly.

**Radix UI Note:** When using Radix components, disable animations with:
```css
animation-duration: 0s !important;
```

### 2. Icons from @indxsearch/pixl Only

**Rule:** All icons must come from the `@indxsearch/pixl` package.

- ❌ `import { ChevronDown } from 'lucide-react'`
- ❌ `import { FaArrow } from 'react-icons/fa'`
- ❌ Custom SVG icons
- ✅ `import { Chevron_down, Plus, Minus } from '@indxsearch/pixl'`

**If an icon doesn't exist in pixl:** Request it to be added to the pixl package rather than importing from another source.

### 3. Typography from globals.css Only

**Rule:** All fonts must be defined in `/packages/indx-systm/src/globals/globals.css`.

Use CSS variables for all text styling:
- ✅ `font: var(--text-sm);`
- ✅ `font: var(--text-md);`
- ✅ `font: var(--text-lg);`
- ✅ `font: var(--text-xl);`
- ✅ `font: var(--text-2xl);`
- ❌ `font-family: 'Inter', sans-serif;`
- ❌ `font-size: 14px;`
- ❌ Custom font imports

## Component Styling Checklist

When creating or modifying components:

- [ ] No shadows used
- [ ] No animations or transitions
- [ ] All icons from @indxsearch/pixl
- [ ] All fonts use var(--text-*) variables
- [ ] Colors use var(--lv*) variables
- [ ] Border radius uses var(--radius)

## Examples

### ❌ Bad
```css
.button {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}
```

```tsx
import { ChevronDown } from 'lucide-react';

<button>
  Click me <ChevronDown />
</button>
```

### ✅ Good
```css
.button {
  font: var(--text-sm);
  background: var(--lv0);
  border: 1px solid var(--lv3);
  border-radius: var(--radius);
}
```

```tsx
import { Chevron_down } from '@indxsearch/pixl';

<button>
  Click me <Chevron_down size={14} color="currentColor" />
</button>
```

## Rationale

These constraints ensure:
1. **Consistent performance** - No animation overhead
2. **Visual consistency** - All icons and typography from same source
3. **Maintainability** - Single source of truth for design tokens
4. **Fast user experience** - Instant feedback, no waiting for animations
