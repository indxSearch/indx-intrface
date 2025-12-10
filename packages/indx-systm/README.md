# @indxsearch/systm

Base UI component library for indxSearch applications.

## Installation

```bash
npm install @indxsearch/systm
```

**Note:** `@indxsearch/pixl` (icon library) is included as a dependency and will be installed automatically.

## Usage

```tsx
import { Button, Checkbox, InputField } from '@indxsearch/systm';
import '@indxsearch/systm/styles.css';

function App() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Checkbox label="Accept terms" />
      <InputField placeholder="Enter text" />
    </div>
  );
}
```

## Components

- **Button** - Customizable button with variants
- **Checkbox** - Checkbox input component
- **InputField** - Text input field
- **RadioButton** - Radio button input
- **SearchField** - Search input with icon
- **Select** - Radix UI select dropdown
- **Slider** - Range slider component
- **ToggleSwitch** - Toggle switch input
- **Popover** - Radix UI popover component
- **Base** - Base container component
- **FilterPanelBase** - Filter panel container

## Custom Cursors (Optional)

Systm includes an optional custom cursor system with 13 cursor utilities. Import the cursors stylesheet to enable:

```tsx
import '@indxsearch/systm/styles.css';
import '@indxsearch/systm/cursors.css'; // Optional custom cursors
```

**Available cursor utilities:**
- `.cursor-pointer` - Hand cursor for clickable elements
- `.cursor-text` - I-beam cursor for text selection
- `.cursor-resize-col` - Column resize cursor
- `.cursor-resize-ew` - Horizontal resize (↔)
- `.cursor-resize-ns` - Vertical resize (↕)
- `.cursor-resize-nwse` - Diagonal resize (↖↘)
- `.cursor-resize-nesw` - Diagonal resize (↗↙)
- `.cursor-move` - Four-way move cursor
- `.cursor-crosshair` - Crosshair for precise selection
- `.cursor-help` - Help cursor
- `.cursor-wait` - Loading cursor
- `.cursor-not-allowed` - Disabled state cursor

All cursors automatically adapt to dark mode via `prefers-color-scheme`.

## Patterns

Systm includes SVG patterns as CSS custom properties, automatically bundled in `styles.css`:

```tsx
import '@indxsearch/systm/styles.css'; // Patterns included by default
```

**Available patterns:**
- `--pattern-checkerboard-light/dark` - 2x2 tight checkerboard
- `--pattern-checkerboard-spaced-4-light/dark` - 1x1 squares with 1px spacing
- `--pattern-checkerboard-spaced-6-light/dark` - 1x1 squares with 2px spacing
- `--pattern-checkerboard-spaced-8-light/dark` - 1x1 squares with 3px spacing
- `--pattern-checkerboard-spaced-10-light/dark` - 1x1 squares with 4px spacing
- `--pattern-grid-6-light/dark` - 6x6 grid with 1x1 dot
- `--pattern-grid-12-light/dark` - 12x12 grid with 1x1 dot
- `--pattern-grid-24-light/dark` - 24x24 grid with 1x1 dot

**Usage:**
```css
.element {
  background-image: var(--pattern-checkerboard-light);
  background-repeat: repeat;
  background-size: 2px 2px;
}

@media (prefers-color-scheme: dark) {
  .element {
    background-image: var(--pattern-checkerboard-dark);
  }
}
```

## Dependencies

- `@indxsearch/pixl` - Icon library
- `@radix-ui/react-select` - Select component primitives
- `react-range` - Range slider component

## Peer Dependencies

- React 19.0.0+
- React DOM 19.0.0+
