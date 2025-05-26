import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { Checkbox } from '@indxsearch/systm';

export interface ValueFilterPanelProps {
  field: string;
  label?: string;
  preserveBlankFacetState?: boolean;
}

export const ValueFilterPanel: React.FC<ValueFilterPanelProps> = ({
  field,
  label,
  preserveBlankFacetState = false,
}) => {
  const {
    state: { facets, filterableFields, facetableFields, filters },
    toggleFilter,
  } = useSearchContext();

  const preservedFacetValuesRef = React.useRef<Record<string, number> | null>(null);

  if (!filterableFields?.includes(field) || !facetableFields?.includes(field)) {
    const missing: string[] = [];
    if (!filterableFields?.includes(field)) missing.push('filterable');
    if (!facetableFields?.includes(field)) missing.push('facetable');
    return (
      <div style={{ color: 'red' }}>
        Cannot render filter for "{field}": missing {missing.join(' and ')}.
      </div>
    );
  }

  const facetValues = facets?.[field];
  if (!facetValues || !Array.isArray(facetValues)) return null;
  const selectedValues = filters?.[field] ?? [];

  if (preserveBlankFacetState && !preservedFacetValuesRef.current && facetValues.length > 0) {
    preservedFacetValuesRef.current = facetValues.reduce((acc: Record<string, number>, f: any) => {
      acc[f.key] = f.value;
      return acc;
    }, {});
  }

  const mergedValuesMap = new Map<string, number>();

  if (preserveBlankFacetState && preservedFacetValuesRef.current) {
    for (const key in preservedFacetValuesRef.current) {
      mergedValuesMap.set(key, 0);
    }
    for (const f of facetValues) {
      mergedValuesMap.set(f.key, f.value);
    }
  } else {
    for (const f of facetValues) {
      mergedValuesMap.set(f.key, f.value);
    }
  }

  return (
    <fieldset>
      <legend>{label || field}</legend>
      <ul>
        {Array.from(mergedValuesMap.entries()).map(([key, count], index) => (
          <li key={index}>
            <Checkbox
              label={`${key} (${count})`}
              checked={selectedValues.includes(key)}
              onChange={() => toggleFilter(field, key)}
              disabled={count === 0}
            />
          </li>
        ))}
      </ul>
    </fieldset>
  );
};
