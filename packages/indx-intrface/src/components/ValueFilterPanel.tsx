import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { Checkbox, Button, ToggleSwitch } from '@indxsearch/systm';

export interface ValueFilterPanelProps {
  field: string;
  label?: string;
  preserveBlankFacetState?: boolean;
  /** which UI control to use for each value */
  displayType?: 'checkbox' | 'button' | 'toggle';
}

export const ValueFilterPanel: React.FC<ValueFilterPanelProps> = ({
  field,
  label,
  preserveBlankFacetState = false,
  displayType = 'checkbox',
}) => {
  const {
    state: { facets, filterableFields, facetableFields, filters },
    toggleFilter,
  } = useSearchContext();

  const preservedFacetValuesRef = React.useRef<Record<string, number> | null>(null);

  // 1) Field validation
  if (!filterableFields?.includes(field) || !facetableFields?.includes(field)) {
    const missing: string[] = [];
    if (!filterableFields?.includes(field)) missing.push('filterable');
    if (!facetableFields?.includes(field))   missing.push('facetable');
    return (
      <div style={{ color: 'red' }}>
        Cannot render filter for "{field}": missing {missing.join(' and ')}.
      </div>
    );
  }

  // 2) Get raw facet values & selected filters
  const facetValues = facets?.[field];
  if (!facetValues || !Array.isArray(facetValues)) return null;
  const selectedValues = filters?.[field] ?? [];

  // 3) Optionally preserve blank state
  if (preserveBlankFacetState && !preservedFacetValuesRef.current && facetValues.length > 0) {
    preservedFacetValuesRef.current = facetValues.reduce((acc: Record<string, number>, f: any) => {
      acc[f.key] = f.value;
      return acc;
    }, {});
  }

  // 4) Merge counts
  const mergedValuesMap = new Map<string, number>();
  if (preserveBlankFacetState && preservedFacetValuesRef.current) {
    Object.entries(preservedFacetValuesRef.current).forEach(([key]) => {
      mergedValuesMap.set(key, 0);
    });
    facetValues.forEach((f: any) => {
      mergedValuesMap.set(f.key, f.value);
    });
  } else {
    facetValues.forEach((f: any) => {
      mergedValuesMap.set(f.key, f.value);
    });
  }

  // 5) Boolean‐toggle special case + validation
  const isBooleanFacet =
    displayType === 'toggle' &&
    mergedValuesMap.size === 2 &&
    mergedValuesMap.has('true') &&
    mergedValuesMap.has('false');

  if (displayType === 'toggle' && !isBooleanFacet) {
    return (
      <div style={{ color: 'red' }}>
        Cannot render toggle for "{field}": facet must have exactly two values "true" and "false".
      </div>
    );
  }

  if (isBooleanFacet) {
    const trueCount = mergedValuesMap.get('true') || 0;
    const isOn = selectedValues.includes('true');
    return (
      <fieldset>
        <legend>{label || field}</legend>
        <ToggleSwitch
          label={`${label || field} (${trueCount})`}
          checked={isOn}
          onChange={() => toggleFilter(field, 'true')}
          disabled={trueCount === 0}
        />
      </fieldset>
    );
  }

  // 6) Fallback: render all entries
  const renderControl = (key: string, count: number) => {
    const isSelected = selectedValues.includes(key);
    const disabled   = count === 0;

    switch (displayType) {
      case 'button':
        return (
          <Button
            variant={isSelected ? 'active' : 'secondary'}
            onClick={() => toggleFilter(field, key)}
            disabled={disabled}
            size="micro"
          >
            {`${key} (${count})`}
          </Button>
        );

      case 'toggle':
        return (
          <ToggleSwitch
            label={key}
            checked={isSelected}
            onChange={() => toggleFilter(field, key)}
            disabled={disabled}
          />
        );

      case 'checkbox':
      default:
        return (
          <Checkbox
            label={key}
            score={`(${count})`}
            checked={isSelected}
            onChange={() => toggleFilter(field, key)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <fieldset>
      <legend>{label || field}</legend>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {Array.from(mergedValuesMap.entries()).map(([key, count], i) => (
          <li key={i} style={{ marginBottom: '0.5rem' }}>
            {renderControl(key, count)}
          </li>
        ))}
      </ul>
    </fieldset>
  );
};
