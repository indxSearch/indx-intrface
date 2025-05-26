import React from 'react';
import { useSearchContext } from '../context/SearchContext';
import { Button } from '@indxsearch/systm';
import { X_or_error } from '@indxsearch/pixl';

export const ActiveFiltersPanel: React.FC = () => {
  const {
    state: { filters, rangeFilters },
    resetFilters,
    resetSingleFilter,
  } = useSearchContext();

  const hasFilters =
    Object.keys(filters).length > 0 || Object.keys(rangeFilters).length > 0;
  if (!hasFilters) return null;

  const handleResetFilters = () => {
    resetFilters(); // Clear all active value and range filters
  };

  return (
    <div>
      <h3>Active Filters</h3>
      <ul>
        {Object.entries(filters).map(([field, values]) =>
          values.map((value: string) => (
            <li key={`${field}-${value}`}>
              <Button 
                onClick={() => resetSingleFilter(field, value)}
                iconRight={<X_or_error/>}
                typeVariant='active'
                size='micro'
              >
                {field}: {value}
              </Button>
            </li>
          ))
        )}
        {Object.entries(rangeFilters).map(([field, { min, max }]) => (
          <li key={field}>
            <Button 
              onClick={() => resetSingleFilter(field)}
              iconRight={<X_or_error/>}
              typeVariant='active'
              size='micro'
            >
              {field}: {min} – {max}
            </Button>
          </li>
        ))}
      </ul>
      <button onClick={handleResetFilters}>Reset</button>
    </div>
  );
};