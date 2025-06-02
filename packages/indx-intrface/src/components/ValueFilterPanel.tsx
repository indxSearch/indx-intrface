import React, { useRef, useState } from 'react';
import styles from './ValueFilterPanel.module.css';
import { useSearchContext } from '../context/SearchContext';
import { Checkbox, Button, ToggleSwitch, FilterPanelBase } from '@indxsearch/systm';

export interface ValueFilterPanelProps {
  field: string;
  label?: string;
  preserveBlankFacetState?: boolean; // True if values should still render when facets are empty
  limit?: number; // Maximum number of items to show before collapsing.
  startCollapsed?: boolean; // If filter should display as collapsed from init
  displayType?: 'checkbox' | 'button' | 'toggle';
  layout?: 'list' | 'grid';
  showActivePanel?: boolean; // Change background color of panel when filtered
}

export const ValueFilterPanel: React.FC<ValueFilterPanelProps> = ({
  field,
  label,
  preserveBlankFacetState = false,
  limit = 10,
  startCollapsed = false,
  displayType = 'checkbox',
  layout = 'list',
  showActivePanel = false,
}) => {
  const {
    state: { facets, filterableFields, facetableFields, filters },
    toggleFilter,
  } = useSearchContext();

  const preservedFacetValuesRef = useRef<Record<string, number | null> | null>(null);
  const [expanded, setExpanded] = useState(false);

  // 1) Field validation
  if (!filterableFields?.includes(field) || !facetableFields?.includes(field)) {
    const missing: string[] = [];
    if (!filterableFields?.includes(field)) missing.push('filterable');
    if (!facetableFields?.includes(field))   missing.push('facetable');
    return (
      <FilterPanelBase collapsible={false}>
        <div style={{ color: 'red', fontSize: '12px' }}>
          Cannot render filter for "{field}": missing {missing.join(' and ')}.
        </div>
      </FilterPanelBase>
    );
  }

  // 2) Get raw facet values & selected filters
  const facetValues = facets?.[field];
  if (!facetValues || !Array.isArray(facetValues)) return null;
  const selectedValues = filters?.[field] ?? [];

  // 3) Optionally preserve blank state
  if (
    preserveBlankFacetState &&
    !preservedFacetValuesRef.current &&
    facetValues.length > 0
  ) {
    preservedFacetValuesRef.current = facetValues.reduce(
      (acc, f: any) => {
        acc[f.key] = f.value;
        return acc;
      },
      {} as Record<string, number | null>
    );
  }

  // 4) Merge counts
  const mergedValuesMap = new Map<string, number | null>();
  if (preserveBlankFacetState && preservedFacetValuesRef.current) {
    Object.keys(preservedFacetValuesRef.current).forEach((key) => {
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
      <FilterPanelBase collapsible={false}>
        <div style={{ color: 'red', fontSize: '12px' }}>
          Cannot render toggle for "{field}": facet must have exactly two values "true" and "false".
        </div>
      </FilterPanelBase>
    );
  }

  if (isBooleanFacet) {
    // Get raw count (could be number or null)
    const rawTrueCount = mergedValuesMap.get('true');
    const trueCount = typeof rawTrueCount === 'number' ? rawTrueCount : null;
    const isOn = selectedValues.includes('true');
    // Disable only if count === 0. If count is null (unknown), leave enabled.
    const disabled = trueCount === 0;
    // Display count only if > 0
    const labelWithCount =
      (trueCount ?? 0) > 0 ? `${label || field} (${trueCount})` : `${label || field}`;

    return (
      <FilterPanelBase collapsible={false} activeFilter={showActivePanel && isOn}>
        <ToggleSwitch
          label={labelWithCount}
          checked={isOn}
          onChange={() => toggleFilter(field, 'true')}
          disabled={disabled}
        />
      </FilterPanelBase>
    );
  }

  // 6) Expand/collapse list based on `limit` prop
  const allEntries = Array.from(mergedValuesMap.entries());
  const shouldCollapse = typeof limit === 'number' && allEntries.length > limit;
  const visibleEntries =
    shouldCollapse && !expanded ? allEntries.slice(0, limit) : allEntries;

  const renderControl = (key: string, count: number | null) => {
    const isSelected = selectedValues.includes(key);
    // Only disable when count === 0. If count is null (unknown), keep enabled.
    const disabled = count === 0;
    // Show count only when count > 0
    const countDisplay = (count ?? 0) > 0 ? ` (${count})` : '';

    switch (displayType) {
      case 'button':
        return (
          <Button
            variant={isSelected ? 'active' : 'secondary'}
            onClick={() => toggleFilter(field, key)}
            disabled={disabled}
            size="micro"
          >
            {`${key}${countDisplay}`}
          </Button>
        );

      case 'toggle':
        return (
          <ToggleSwitch
            // If you want to include the count on the toggle label, use `${key}${countDisplay}`
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
            // Only render score when count > 0; otherwise pass an empty string
            score={(count ?? 0) > 0 ? `(${count})` : ''}
            checked={isSelected}
            onChange={() => toggleFilter(field, key)}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FilterPanelBase
      title={label}
      collapsed={startCollapsed}
      activeFilter={showActivePanel && selectedValues.length > 0}
    >
      <ul
        className={layout === 'grid' ? styles.grid : styles.list}
        style={{ listStyle: 'none', padding: 0, margin: 0 }}
      >
        {visibleEntries.map(([key, count]) => (
          <li key={key}>{renderControl(key, count)}</li>
        ))}
        {shouldCollapse && (
          <li className={styles.toggleItem}>
            <Button
              variant="tertiary"
              size="micro"
              onClick={() => setExpanded((prev) => !prev)}
            >
              {expanded
                ? 'Show less'
                : `Show ${allEntries.length - (limit ?? 0)} more`}
            </Button>
          </li>
        )}
      </ul>
    </FilterPanelBase>
  );
};
