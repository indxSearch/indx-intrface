import React from 'react';
import { useSearchContext } from '../context/SearchContext';

export const ActiveFiltersPanel: React.FC = () => {
  const {
    state: { filters, rangeFilters },
    resetFilters,
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
              {field}: {value}
            </li>
          ))
        )}
        {Object.entries(rangeFilters).map(([field, { min, max }]) => (
          <li key={field}>
            {field}: {min} – {max}
          </li>
        ))}
      </ul>
      <button onClick={handleResetFilters}>Reset</button>
    </div>
  );
};