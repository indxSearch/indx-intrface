import React, { useRef, useState } from 'react';
import styles from './ValueFilterPanel.module.css';
import { useSearchContext } from '../context/SearchContext';
import { Checkbox, Button, ToggleSwitch, FilterPanelBase } from '@indxsearch/systm';

export interface ValueFilterPanelProps {
  field: string;
  label?: string;
  preserveBlankFacetState?: boolean; // True if values should still render when facets are empty
  limit?: number; // Maximum number of items to show before collapsing.
  collapsible?: boolean; // If filter panel should be able to be collapsed
  startCollapsed?: boolean; // If filter should display as collapsed from init
  displayType?: 'checkbox' | 'button' | 'toggle';
  layout?: 'list' | 'grid';
  showActivePanel?: boolean; // Change background color of panel when filtered
  showNull?: boolean; // If true, include entries with count === null
}

export const ValueFilterPanel: React.FC<ValueFilterPanelProps> = ({
  field,
  label,
  preserveBlankFacetState = false,
  limit = 10,
  collapsible = true,
  startCollapsed = false,
  displayType = 'checkbox',
  layout = 'list',
  showActivePanel = false,
  showNull = false
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
    // Display just the number if > 0
    const countLabel = (trueCount ?? 0) > 0 ? `${trueCount}` : '';

    // If panel itself is not collapsible, override collapsed to false
    const actualCollapsed = collapsible ? startCollapsed : false;

    // For boolean facet, the panel should always be non-collapsible
    return (
      <FilterPanelBase collapsible={false} activeFilter={showActivePanel && isOn}>
        <div className={styles.count}>
          <ToggleSwitch
            label={label}
            checked={isOn}
            onChange={() => toggleFilter(field, 'true')}
            disabled={disabled}
          />{' '}
          {countLabel}
        </div>
      </FilterPanelBase>
    );
  }

  // 6) Expand/collapse list based on `limit` prop
  let allEntries = Array.from(mergedValuesMap.entries());
  if (!showNull) {
    // drop any entry whose key is the string "null"
    allEntries = allEntries.filter(([key,]) => key !== 'null');
  }
  const shouldCollapse = typeof limit === 'number' && allEntries.length > limit;
  const visibleEntries =
    shouldCollapse && !expanded ? allEntries.slice(0, limit) : allEntries;

  const renderControl = (key: string, count: number | null) => {
    const isSelected = selectedValues.includes(key);
    // Only disable when count === 0. If count is null (unknown), keep enabled.
    const disabled = count === 0;
    // For grid layout, show "(n)" within the control
    const countDisplay = (count ?? 0) > 0 ? ` (${count})` : '';
    // For list layout, show count as plain number to the right
    const countNumber = (count ?? 0) > 0 ? count : '';

    switch (displayType) {
      case 'button':
        if (layout === 'list') {
          return (
            <div className={styles.count}>
              <Button
                variant={isSelected ? 'active' : 'secondary'}
                onClick={() => toggleFilter(field, key)}
                disabled={disabled}
                size="micro"
              >
                {key}
              </Button>
              <span>{countNumber}</span>
            </div>
          );
        }
        // grid
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
            label={key}
            checked={isSelected}
            onChange={() => toggleFilter(field, key)}
            disabled={disabled}
          />
        );

      case 'checkbox':
      default:
        if (layout === 'list') {
          return (
            <div className={styles.count}>
              <Checkbox
                label={key}
                score=""
                checked={isSelected}
                onChange={() => toggleFilter(field, key)}
                disabled={disabled}
              />
              <span>{countNumber}</span>
            </div>
          );
        }
        // grid
        return (
          <Checkbox
            label={key}
            score={(count ?? 0) > 0 ? `(${count})` : ''}
            checked={isSelected}
            onChange={() => toggleFilter(field, key)}
            disabled={disabled}
          />
        );
    }
  };

  // Determine whether to actually collapse based on `collapsible` + `startCollapsed`
  const actualCollapsed = collapsible ? startCollapsed : false;

  return (
    <FilterPanelBase
      title={label}
      collapsible={collapsible}
      collapsed={actualCollapsed}
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
