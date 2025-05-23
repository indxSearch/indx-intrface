import React from 'react';
import { useSearchContext } from '../context/SearchContext';

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
              <button onClick={() => resetSingleFilter(field, value)}>
                {field}: {value} ❌
              </button>
            </li>
          ))
        )}
        {Object.entries(rangeFilters).map(([field, { min, max }]) => (
          <li key={field}>
            <button onClick={() => resetSingleFilter(field)}>
              {field}: {min} – {max} ❌
            </button>
          </li>
        ))}
      </ul>
      <button onClick={handleResetFilters}>Reset</button>
    </div>
  );
};