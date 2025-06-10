import React, { useMemo, memo } from "react";
import styles from './ActiveFiltersPanel.module.css';
import { useSearchContext } from '../context/SearchContext';
import { FilterPanelBase } from '@indxsearch/systm';
import { Button } from '@indxsearch/systm';
import { X_or_error } from '@indxsearch/pixl';

const ValueFilterButton = memo(({ field, value, onReset }: { field: string, value: string, onReset: () => void }) => (
  <li>
    <Button 
      onClick={onReset}
      iconRight={<X_or_error/>}
      variant='active'
      size='micro'
    >
      {field}: {value}
    </Button>
  </li>
));

const RangeFilterButton = memo(({ field, min, max, onReset }: { field: string, min: number, max: number, onReset: () => void }) => (
  <li>
    <Button 
      onClick={onReset}
      iconRight={<X_or_error />}
      variant='primary'
      size='micro'
    >
      {field}: {min} – {max}
    </Button>
  </li>
));

export function ActiveFiltersPanel() {
  const {
    state: { filters, rangeFilters },
    resetFilters,
    resetSingleFilter,
  } = useSearchContext();

  const filterEntries = useMemo(() => 
    Object.entries(filters).map(([field, values]) =>
      values.map((value: string) => ({ field, value }))
    ).flat(),
    [filters]
  );

  const rangeFilterEntries = useMemo(() => 
    Object.entries(rangeFilters).map(([field, { min, max }]) => ({ field, min, max })),
    [rangeFilters]
  );

  const hasFilters = useMemo(() => 
    Object.keys(filters).length > 0 || Object.keys(rangeFilters).length > 0,
    [filters, rangeFilters]
  );

  if (!hasFilters) return null;

  return (
    <FilterPanelBase activeFilter={true} collapsible={false} title="Active filters">
      <ul className={styles.grid}>
        {filterEntries.map(({ field, value }) => (
          <ValueFilterButton
            key={`${field}-${value}`}
            field={field}
            value={value}
            onReset={() => resetSingleFilter(field, value)}
          />
        ))}
        {rangeFilterEntries.map(({ field, min, max }) => (
          <RangeFilterButton
            key={field}
            field={field}
            min={min}
            max={max}
            onReset={() => resetSingleFilter(field)}
          />
        ))}
        <li>
          <Button 
            onClick={resetFilters}
            size='micro'
            variant='tertiary'
          >
            Reset
          </Button>
        </li>
      </ul>
    </FilterPanelBase>
  );
};