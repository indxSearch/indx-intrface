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

## Dependencies

- `@indxsearch/pixl` - Icon library
- `@radix-ui/react-select` - Select component primitives
- `react-range` - Range slider component

## Peer Dependencies

- React 19.0.0+
- React DOM 19.0.0+
